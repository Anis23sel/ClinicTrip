"use client";
import React, { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FaqItem[] = [
  {
    category: "Booking & Procedures",
    question: "Are the clinics on Clinic Trip verified?",
    answer: "Yes, all clinics listed on our platform undergo a thorough verification process regarding their accreditations, medical staff credentials, and patient reviews."
  },
  {
    category: "Booking & Procedures",
    question: "How do I book a procedure with a clinic?",
    answer: "You can browse our verified clinics, select a procedure that fits your needs, and submit a booking request directly through the clinic's page. The clinic will review your request and get back to you."
  },
  
  {
    category: "Travel & Stay",
    question: "Do you help with travel and accommodation arrangements?",
    answer: "Yes! Clinic Trip helps you compare medical options and often coordinates with partner clinics that offer all-inclusive packages covering airport transfers, hotel stays, and local translation services."
  },
  {
    category: "Travel & Stay",
    question: "When can I leave for my medical trip after booking?",
    answer: "The timeline depends on the clinic's availability and the type of procedure. Once your booking request is accepted, the clinic's coordinator will work with you to finalize a schedule that suits your travel plans."
  },
  {
    category: "Payments",
    question: "How do payments work?",
    answer: "Payment structures vary by clinic. Typically, a small deposit is required to secure your appointment, while the remaining balance is paid directly to the clinic upon arrival or after your consultation."
  }
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Booking & Procedures", "Travel & Stay", "Payments"];

  const filteredFaqs = selectedCategory === "All" 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            Got questions about medical tourism, booking, or your trip? Find answers to our most common questions below.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setOpenIndex(null);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-card-foreground border border-border hover:bg-muted"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className="border border-border rounded-xl bg-card text-card-foreground overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center font-medium focus:outline-none"
                >
                  <span className="text-base sm:text-lg text-foreground">{faq.question}</span>
                  <span className={`ml-4 transform transition-transform duration-200 text-primary font-bold text-xl ${isOpen ? "rotate-45" : ""}`}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm sm:text-base text-muted-foreground border-t border-border/50 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions banner */}
        <div className="mt-16 bg-card border border-border rounded-2xl p-8 text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">Still have questions?</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Can’t find the answer you’re looking for? Feel free to reach out to our support team.
          </p>
          <a
            href="/contact"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity"
          >
            Contact Support
          </a>
        </div>

      </div>
    </div>
  );
}