export default function WardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ward</h1>
          <p className="text-gray-600 mt-2">Manage inpatient care and bed allocation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-medium">Total Beds</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">0</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-medium">Occupied Beds</div>
            <div className="text-3xl font-bold text-red-600 mt-2">0</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-medium">Available Beds</div>
            <div className="text-3xl font-bold text-green-600 mt-2">0</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-medium">Occupancy Rate</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">0%</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Bed Management</h2>
          </div>
          <div className="p-6">
            <div className="text-center text-gray-500 py-8">
              <p>No bed assignments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
