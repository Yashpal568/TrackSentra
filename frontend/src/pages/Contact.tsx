import React, { useState } from 'react';
import { Button } from '../components/ui/Button';

export const Contact = () => {
  const [status, setStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For M17 demo purposes, we will mock the contact form processing securely.
    setStatus('Thank you for reaching out! Your request has been securely processed. Our team will contact you shortly.');
  };

  return (
    <div className="py-20 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4">Contact Sales & Request a Demo</h1>
        <p className="text-xl text-gray-600">We'd love to show you how TrackSentra can upgrade your security operations.</p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        {status ? (
          <div className="bg-green-50 text-green-800 p-6 rounded-md text-center">
            <h3 className="font-bold text-lg mb-2">Request Received</h3>
            <p>{status}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input required type="text" className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Email</label>
                <input required type="email" className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" placeholder="john@securitycompany.com" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input required type="text" className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" placeholder="Acme Security Services" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea required rows={4} className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" placeholder="Tell us about your requirements..."></textarea>
            </div>

            <Button type="submit" className="w-full text-lg py-3 h-auto">Submit Request</Button>
            <p className="text-xs text-gray-500 text-center mt-4">By submitting this form, you agree to our Privacy Policy.</p>
          </form>
        )}
      </div>
    </div>
  );
};
