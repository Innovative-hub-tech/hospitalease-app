import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { hash } from "argon2";

// Register a new admin account
export async function POST(request) {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session || !session.user) {
      return Response.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      password,
      role,
      departmentId,
    } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return Response.json(
        {
          success: false,
          error: "Missing required fields: name, email, password, role",
        },
        { status: 400 },
      );
    }

    // Validate role
    if (!['global', 'department'].includes(role)) {
      return Response.json(
        { success: false, error: "Invalid admin role. Must be 'global' or 'department'" },
        { status: 400 },
      );
    }

    // If department role, require departmentId
    if (role === 'department' && !departmentId) {
      return Response.json(
        { success: false, error: "Department ID is required for department admin role" },
        { status: 400 },
      );
    }

    // Check if creator is global admin
    const [creator] = await sql`
      SELECT id, role FROM admin_accounts WHERE email = ${session.user.email}
    `;

    if (!creator || creator.role !== 'global') {
      return Response.json(
        { success: false, error: "Only global admins can register new admins" },
        { status: 403 },
      );
    }

    // Check if email already exists
    const [existingAdmin] = await sql`
      SELECT id FROM admin_accounts WHERE email = ${email}
    `;

    if (existingAdmin) {
      return Response.json(
        { success: false, error: "Email already registered" },
        { status: 400 },
      );
    }

    // Verify department exists if provided
    if (departmentId) {
      const [dept] = await sql`SELECT id FROM departments WHERE id = ${departmentId}`;
      if (!dept) {
        return Response.json(
          { success: false, error: "Department not found" },
          { status: 400 },
        );
      }
    }

    // Hash password
    const passwordHash = await hash(password);

    // Create admin account
    const [newAdmin] = await sql`
      INSERT INTO admin_accounts (
        name, email, password_hash, role, department_id, created_by
      ) VALUES (
        ${name}, ${email}, ${passwordHash}, ${role}, ${departmentId || null}, ${creator.id}
      ) RETURNING id, name, email, role, department_id
    `;

    // Create notification for creator
    await sql`
      INSERT INTO notifications (
        type, recipient_id, title, message
      ) VALUES (
        'admin_registration', ${creator.id}, 
        'New Admin Registered', 
        'Admin account created for ' || ${name} || ' (' || ${email} || ')'
      )
    `;

    return Response.json({
      success: true,
      adminId: newAdmin.id,
      admin: newAdmin,
      message: "Admin account created successfully",
    });
  } catch (error) {
    console.error("Error registering admin:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
