import React from 'react';
import { HelpCircle, Plus } from 'lucide-react';

const FAQManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
        <p className="text-gray-600 mt-2">Manage frequently asked questions</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <HelpCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">FAQ Management</h3>
          <p className="text-gray-600 mb-6">This feature is coming soon. You'll be able to manage FAQs here.</p>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto">
            <Plus className="h-5 w-5" />
            <span>Add New FAQ</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQManagement;