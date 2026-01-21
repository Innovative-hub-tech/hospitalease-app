import sql from "@/app/api/utils/sql";

// Get all patients with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const patientType = searchParams.get("type");
    const status = searchParams.get("status");

    let query = "SELECT * FROM patients WHERE 1=1";
    const values = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (LOWER(first_name) LIKE LOWER($${paramCount}) OR LOWER(last_name) LIKE LOWER($${paramCount}) OR LOWER(patient_id) LIKE LOWER($${paramCount}))`;
      values.push(`%${search}%`);
    }

    if (patientType) {
      paramCount++;
      query += ` AND patient_type = $${paramCount}`;
      values.push(patientType);
    }

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      values.push(status);
    }

    query += " ORDER BY created_at DESC";

    const patients = await sql(query, values);
    return Response.json({ success: true, patients });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// Create a new patient
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      patient_id,
      first_name,
      last_name,
      date_of_birth,
      gender,
      phone,
      email,
      address,
      patient_type,
      blood_group,
      allergies,
      emergency_contact_name,
      emergency_contact_phone,
      next_of_kin,
      is_hmo,
      hmo_name,
      hmo_id_number,
    } = body;

    // Validate required fields
    if (
      !patient_id ||
      !first_name ||
      !last_name ||
      !date_of_birth ||
      !gender ||
      !phone ||
      !patient_type
    ) {
      return Response.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      );
    }

    // Get Reception/FrontDesk department ID
    const [receptionDept] = await sql`
      SELECT id FROM departments WHERE name = 'Reception/FrontDesk' LIMIT 1
    `;

    const result = await sql`
      INSERT INTO patients (
        patient_id, first_name, last_name, date_of_birth, gender, phone, 
        email, address, patient_type, blood_group, allergies, 
        emergency_contact_name, emergency_contact_phone, next_of_kin,
        is_hmo, hmo_name, hmo_id_number, current_department_id
      ) VALUES (
        ${patient_id}, ${first_name}, ${last_name}, ${date_of_birth}, ${gender}, ${phone},
        ${email || null}, ${address || null}, ${patient_type}, ${blood_group || null}, 
        ${allergies || null}, ${emergency_contact_name || null}, ${emergency_contact_phone || null},
        ${next_of_kin || null}, ${is_hmo || false}, ${hmo_name || null}, ${hmo_id_number || null},
        ${receptionDept ? receptionDept.id : null}
      ) RETURNING *
    `;

    // Create initial workflow record
    if (receptionDept) {
      await sql`
        INSERT INTO patient_workflow (patient_id, to_department_id, notes)
        VALUES (${result[0].id}, ${receptionDept.id}, 'Patient registered at reception')
      `;
    }

    // Create initial visit record
    await sql`
      INSERT INTO patient_visits (patient_id, department_id, reason, status)
      VALUES (${result[0].id}, ${receptionDept ? receptionDept.id : null}, 'Initial registration', 'pending')
    `;

    return Response.json({ success: true, patient: result[0] });
  } catch (error) {
    console.error("Error creating patient:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
