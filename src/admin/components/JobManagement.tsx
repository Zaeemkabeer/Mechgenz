import React from 'react';
import { Briefcase, Plus } from 'lucide-react';

const JobManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
        <p className="text-gray-600 mt-2">Manage job postings and applications</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Job Management</h3>
          <p className="text-gray-600 mb-6">This feature is coming soon. You'll be able to manage job postings and applications here.</p>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto">
            <Plus className="h-5 w-5" />
            <span>Add New Job</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobManagement;