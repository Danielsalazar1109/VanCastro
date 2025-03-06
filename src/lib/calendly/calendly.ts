import axios from 'axios';

if (!process.env.CALENDLY_API_KEY) {
  throw new Error('Please define the CALENDLY_API_KEY environment variable');
}

if (!process.env.CALENDLY_USER) {
  throw new Error('Please define the CALENDLY_USER environment variable');
}

const calendlyApi = axios.create({
  baseURL: 'https://api.calendly.com',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.CALENDLY_API_KEY}`,
  },
});

export const getAvailableTimeSlots = async (startDate: Date, endDate: Date) => {
  try {
    const response = await calendlyApi.get(`/scheduled_events`, {
      params: {
        user: process.env.CALENDLY_USER,
        min_start_time: startDate.toISOString(),
        max_start_time: endDate.toISOString(),
        status: 'active',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching Calendly time slots:', error);
    throw error;
  }
};

export default calendlyApi;
