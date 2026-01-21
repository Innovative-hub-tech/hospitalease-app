import sql from "@/app/api/utils/sql";

// Get all departments
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = "SELECT * FROM departments WHERE 1=1";
    const values = [];

    if (status) {
      query += " AND status = $1";
      values.push(status);
    }

    query += " ORDER BY name ASC";

    const departments = await sql(query, values);
    return Response.json({ success: true, departments });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
