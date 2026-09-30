
export const FAQ = () => {
  const faqs = [
    {
      question: 'How do QR checkpoints work?',
      answer: 'You define checkpoints for a site in the TrackSentra dashboard. The system generates unique QR codes which you can print and place at physical locations. Guards then scan these codes during their patrols using their mobile devices to log their presence.'
    },
    {
      question: 'Do guards need a special app?',
      answer: 'No, TrackSentra is a mobile-first web application. Guards can simply log in through the browser on their smartphones and access the guard interface, which is optimized for mobile screens.'
    },
    {
      question: 'Is GPS tracking continuous?',
      answer: 'TrackSentra captures GPS coordinates at critical moments: when a checkpoint is scanned or when an incident is reported. This ensures accuracy and verifies presence without draining the guard\'s device battery through continuous tracking.'
    },
    {
      question: 'How does billing work?',
      answer: 'We offer flexible subscription plans based on your needs. Billing is handled on a monthly or annual basis, and limits apply depending on your chosen tier (e.g., maximum guards, maximum sites).'
    },
    {
      question: 'What happens if a guard misses a checkpoint?',
      answer: 'The system automatically flags missed checkpoints. You can view these anomalies in real-time on the Live Monitoring dashboard and in the historical Reports section.'
    },
    {
      question: 'Can I export my data?',
      answer: 'Yes! All operational summaries, guard reports, and incident logs can be exported to CSV formats for your compliance records or client presentations.'
    }
  ];

  return (
    <div className="py-20 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold mb-6">Frequently Asked Questions</h1>
        <p className="text-xl text-gray-600">Got questions? We've got answers.</p>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.question}</h3>
            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
