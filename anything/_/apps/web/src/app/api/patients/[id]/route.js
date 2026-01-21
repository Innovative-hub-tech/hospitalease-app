import sql from "@/app/api/utils/sql";

// Get a single patient
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const patient = await sql`
      SELECT p.*, d.name as current_department_name
      FROM patients p
      LEFT JOIN departments d ON p.current_department_id = d.id
      WHERE p.id = ${id}
    `;

    if (patient.length === 0) {
      return Response.json(
        { success: false, error: "Patient not found" },
        { status: 404 },
      );
    }

    return Response.json({ success: true, patient: patient[0] });
  } catch (error) {
    console.error("Error fetching patient:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// Update a patient
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const updates = [];
    const values = [];
    let paramCount = 0;

    const allowedFields = [
      "first_name",
      "last_name",
      "date_of_birth",
      "gender",
      "phone",
      "email",
      "address",
      "patient_type",
      "blood_group",
      "allergies",
      "emergency_contact_name",
      "emergency_contact_phone",
      "status",
      "discharge_date",
      "next_of_kin",
      "is_hmo",
      "hmo_name",
      "hmo_id_number",
      "current_department_id",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        paramCount++;
        updates.push(`${field} = $${paramCount}`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) {
      return Response.json(
        { success: false, error: "No fields to update" },
        { status: 400 },
      );
    }

    paramCount++;
    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE patients SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json(
        { success: false, error: "Patient not found" },
        { status: 404 },
      );
    }

    return Response.json({ success: true, patient: result[0] });
  } catch (error) {
    console.error("Error updating patient:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// Delete a patient
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await sql`DELETE FROM patients WHERE id = ${id} RETURNING *`;

    if (result.length === 0) {
      return Response.json(
        { success: false, error: "Patient not found" },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
