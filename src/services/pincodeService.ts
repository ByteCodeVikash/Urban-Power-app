import axios from 'axios';

export interface PincodeDetails {
  city: string;
  state: string;
  localities: string[];
}

export const pincodeService = {
  lookup: async (pincode: string): Promise<PincodeDetails | null> => {
    if (!/^\d{6}$/.test(pincode)) {
      return null;
    }

    try {
      const response = await axios.get(
        `https://api.postalpincode.in/pincode/${pincode}`,
        {
          timeout: 10000,
        },
      );

      const data = response.data;
      if (
        data &&
        Array.isArray(data) &&
        data.length > 0 &&
        data[0].Status === 'Success' &&
        Array.isArray(data[0].PostOffice) &&
        data[0].PostOffice.length > 0
      ) {
        const postOffices = data[0].PostOffice;
        const city = postOffices[0].District || '';
        const state = postOffices[0].State || '';
        const localities = postOffices
          .map((po: any) => po.Name)
          .filter(Boolean);

        return {
          city,
          state,
          localities,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching pincode details:', error);
      // Return null instead of throwing so callers can show a friendly message
      return null;
    }
  },
};
