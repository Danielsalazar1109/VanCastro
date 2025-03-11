'use client';

import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

const ContactForm = ({ recipientEmail = 'vancastroadmi@gmail.com' }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const [status, setStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });

  const [loading, setLoading] = useState(false);

  // Inicializar EmailJS solo una vez
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    if (publicKey) {
      emailjs.init(publicKey); // Solo se inicializa una vez
    } else {
      console.error('EmailJS public key is missing');
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const serviceid = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
    const templateid = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';

    // Verificar si tenemos todas las credenciales necesarias
    if (!serviceid || !templateid) {
      console.error('Error: Missing EmailJS service or template ID');
      setStatus({
        submitted: true,
        success: false,
        message: 'There was an error sending your message. Please try again later.'
      });
      setLoading(false);
      return;
    }

    try {
      const templateParams = {
        to_email: recipientEmail,
        from_name: formData.name,
        from_email: formData.email,
        from_phone: formData.phone,
        message: formData.message
      };

      // Enviar el correo usando las credenciales del servicio y plantilla
      await emailjs.send(serviceid, templateid, templateParams);

      setStatus({
        submitted: true,
        success: true,
        message: 'Thank you! Your message has been sent successfully.'
      });

      // Limpiar el formulario
      setFormData({
        name: '',
        phone: '',
        email: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending email:', error);
      setStatus({
        submitted: true,
        success: false,
        message: 'There was an error sending your message. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-yellow-400 rounded-lg p-6">
      {status.submitted ? (
        <div className={`p-4 rounded-md ${status.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <p className="text-center font-medium">{status.message}</p>
          {!status.success && (
            <button
              onClick={() => setStatus({ submitted: false, success: false, message: '' })}
              className="mt-4 w-full bg-gray-900 text-white p-3 rounded-md font-medium hover:bg-gray-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      ) : (
        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="p-3 rounded-md border-0"
            required
          />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="p-3 rounded-md border-0"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="p-3 rounded-md border-0"
            required
          />
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Write message..."
            className="p-3 rounded-md border-0 min-h-32"
            required
          />
          <button
            type="submit"
            className="bg-gray-900 text-white p-3 rounded-md font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Submit'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactForm;
