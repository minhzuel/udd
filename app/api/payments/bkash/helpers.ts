// bKash API helper functions
import { cookies } from 'next/headers';

// bKash API configuration
const BKASH_CONFIG = {
  baseURL: 'https://checkout.sandbox.bka.sh/v1.2.0-beta', // For production: https://checkout.pay.bka.sh/v1.2.0-beta
  appKey: '5nej5keguopj928ekcj3dne8p',
  appSecret: '1honf6u1c56mqcivtc9ffl960slp4v2756jle5925nbooa46ch62',
  username: 'testdemo',
  password: 'test%#de23@msdao'
};

// Get token from bKash API
export async function getToken() {
  try {
    console.log('Getting bKash token with credentials:', {
      appKey: BKASH_CONFIG.appKey,
      username: BKASH_CONFIG.username,
      // Not logging password for security
    });
    
    const response = await fetch(`${BKASH_CONFIG.baseURL}/checkout/token/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-APP-Key': BKASH_CONFIG.appKey,
        'username': BKASH_CONFIG.username,
        'password': BKASH_CONFIG.password
      },
      body: JSON.stringify({
        app_key: BKASH_CONFIG.appKey,
        app_secret: BKASH_CONFIG.appSecret
      }),
      cache: 'no-cache'
    });

    if (!response.ok) {
      const statusText = response.statusText;
      console.error('bKash token API error:', {
        status: response.status,
        statusText: statusText
      });
      throw new Error(`Token API error: ${response.status} ${statusText}`);
    }

    const data = await response.json();
    console.log('bKash token API response:', data);
    
    if (data.msg) {
      console.error('bKash token API error message:', data.msg);
      throw new Error(data.msg);
    }
    
    if (!data.id_token) {
      console.error('bKash token API response is missing id_token:', data);
      throw new Error('Token API response missing id_token');
    }
    
    return data.id_token;
  } catch (error) {
    console.error('Error getting bKash token:', error);
    throw error;
  }
}

// Create payment
export async function createPayment(amount: number, orderId: number, token: string) {
  try {
    // Ensure amount is a valid number
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
      throw new Error(`Invalid amount: ${amount}`);
    }
    
    console.log('Creating bKash payment with params:', {
      amount: numericAmount.toFixed(2),
      merchantInvoiceNumber: `INV-${orderId}-${Date.now()}`
    });
    
    const paymentData = {
      amount: numericAmount.toFixed(2),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: `INV-${orderId}-${Date.now()}`
    };
    
    console.log('bKash payment request data:', paymentData);
    
    const response = await fetch(`${BKASH_CONFIG.baseURL}/checkout/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-APP-Key': BKASH_CONFIG.appKey
      },
      body: JSON.stringify(paymentData),
      cache: 'no-cache'
    });

    if (!response.ok) {
      console.error('bKash payment create API error:', {
        status: response.status,
        statusText: response.statusText
      });
    }

    const responseData = await response.json();
    console.log('bKash payment create API response:', responseData);
    
    return responseData;
  } catch (error) {
    console.error('Error creating bKash payment:', error);
    throw error;
  }
}

// Execute payment
export async function executePayment(paymentID: string, token: string) {
  try {
    console.log('Executing bKash payment for paymentID:', paymentID);
    
    const response = await fetch(`${BKASH_CONFIG.baseURL}/checkout/payment/execute/${paymentID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-APP-Key': BKASH_CONFIG.appKey
      },
      cache: 'no-cache'
    });

    if (!response.ok) {
      console.error('bKash execute payment API error:', {
        status: response.status,
        statusText: response.statusText
      });
    }

    const responseData = await response.json();
    console.log('bKash execute payment response:', responseData);
    
    return responseData;
  } catch (error) {
    console.error('Error executing bKash payment:', error);
    throw error;
  }
}

// Query payment
export async function queryPayment(paymentID: string, token: string) {
  try {
    console.log('Querying bKash payment for paymentID:', paymentID);

    const response = await fetch(`${BKASH_CONFIG.baseURL}/checkout/payment/query/${paymentID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-APP-Key': BKASH_CONFIG.appKey
      },
      cache: 'no-cache'
    });

    if (!response.ok) {
      console.error('bKash query payment API error:', {
        status: response.status,
        statusText: response.statusText
      });
    }

    const responseData = await response.json();
    console.log('bKash query payment response:', responseData);
    
    return responseData;
  } catch (error) {
    console.error('Error querying bKash payment:', error);
    throw error;
  }
}

// Search transaction
export async function searchTransaction(trxID: string, token: string) {
  try {
    console.log('Searching bKash transaction for trxID:', trxID);
    
    const response = await fetch(`${BKASH_CONFIG.baseURL}/checkout/payment/search/${trxID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-APP-Key': BKASH_CONFIG.appKey
      },
      cache: 'no-cache'
    });

    if (!response.ok) {
      console.error('bKash search transaction API error:', {
        status: response.status,
        statusText: response.statusText
      });
    }

    const responseData = await response.json();
    console.log('bKash search transaction response:', responseData);
    
    return responseData;
  } catch (error) {
    console.error('Error searching bKash transaction:', error);
    throw error;
  }
} 