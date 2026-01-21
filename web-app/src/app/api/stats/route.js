import sql from "@/app/api/utils/sql";

// Get dashboard statistics
export async function GET(request) {
  try {
    const [stats] = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'active') as total_active_patients,
        COUNT(*) FILTER (WHERE patient_type = 'in-patient' AND status = 'active') as total_inpatients,
        COUNT(*) FILTER (WHERE patient_type = 'out-patient' AND status = 'active') as total_outpatients,
        COUNT(*) as total_patients
      FROM patients
    `;

    const [visitStats] = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending_visits,
        COUNT(*) FILTER (WHERE status = 'in-progress') as ongoing_visits,
        COUNT(*) FILTER (WHERE DATE(visit_date) = CURRENT_DATE) as todays_visits
      FROM patient_visits
    `;

    const [billingStats] = await sql`
      SELECT 
        COALESCE(SUM(amount) FILTER (WHERE payment_status = 'pending'), 0) as pending_payments,
        COALESCE(SUM(amount) FILTER (WHERE payment_status = 'paid' AND DATE(paid_at) = CURRENT_DATE), 0) as todays_revenue
      FROM billing
    `;

    return Response.json({
      success: true,
      stats: {
        ...stats,
        ...visitStats,
        ...billingStats,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
