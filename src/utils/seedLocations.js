import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { Location } from '../models/Location.js'

dotenv.config({ path: path.join(process.cwd(), '.env') })

export const defaultLocations = [
  // Uttar Pradesh
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Uttar Pradesh', stateCode: 'UP', city: 'Lucknow', pincodesCount: 226, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Uttar Pradesh', stateCode: 'UP', city: 'Kanpur', pincodesCount: 208, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Uttar Pradesh', stateCode: 'UP', city: 'Noida', pincodesCount: 84, tier: 'Tier 1', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Uttar Pradesh', stateCode: 'UP', city: 'Greater Noida', pincodesCount: 42, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Uttar Pradesh', stateCode: 'UP', city: 'Varanasi', pincodesCount: 118, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Uttar Pradesh', stateCode: 'UP', city: 'Agra', pincodesCount: 112, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Uttar Pradesh', stateCode: 'UP', city: 'Prayagraj', pincodesCount: 96, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Uttar Pradesh', stateCode: 'UP', city: 'Ghaziabad', pincodesCount: 78, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Uttar Pradesh', stateCode: 'UP', city: 'Meerut', pincodesCount: 65, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Uttar Pradesh', stateCode: 'UP', city: 'Bareilly', pincodesCount: 48, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Uttar Pradesh', stateCode: 'UP', city: 'Aligarh', pincodesCount: 44, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Uttar Pradesh', stateCode: 'UP', city: 'Gorakhpur', pincodesCount: 52, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Uttar Pradesh', stateCode: 'UP', city: 'Moradabad', pincodesCount: 40, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Uttar Pradesh', stateCode: 'UP', city: 'Jhansi', pincodesCount: 36, tier: 'Tier 3', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Uttar Pradesh', stateCode: 'UP', city: 'Ayodhya', pincodesCount: 45, tier: 'Tier 3', status: 'Active' },

  // Maharashtra
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Maharashtra', stateCode: 'MH', city: 'Mumbai', pincodesCount: 312, tier: 'Tier 1', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Maharashtra', stateCode: 'MH', city: 'Pune', pincodesCount: 184, tier: 'Tier 1', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Maharashtra', stateCode: 'MH', city: 'Nagpur', pincodesCount: 92, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Maharashtra', stateCode: 'MH', city: 'Thane', pincodesCount: 86, tier: 'Tier 1', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Maharashtra', stateCode: 'MH', city: 'Nashik', pincodesCount: 64, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Maharashtra', stateCode: 'MH', city: 'Chhatrapati Sambhajinagar', pincodesCount: 52, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Maharashtra', stateCode: 'MH', city: 'Navi Mumbai', pincodesCount: 48, tier: 'Tier 1', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Maharashtra', stateCode: 'MH', city: 'Solapur', pincodesCount: 38, tier: 'Tier 3', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Maharashtra', stateCode: 'MH', city: 'Kolhapur', pincodesCount: 34, tier: 'Tier 3', status: 'Active' },

  // Delhi NCR
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Delhi', stateCode: 'DL', city: 'New Delhi', pincodesCount: 142, tier: 'Tier 1', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Delhi', stateCode: 'DL', city: 'North Delhi', pincodesCount: 68, tier: 'Tier 1', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Delhi', stateCode: 'DL', city: 'South Delhi', pincodesCount: 82, tier: 'Tier 1', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Delhi', stateCode: 'DL', city: 'Dwarka', pincodesCount: 38, tier: 'Tier 1', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Delhi', stateCode: 'DL', city: 'Rohini', pincodesCount: 44, tier: 'Tier 1', status: 'Active' },

  // Karnataka
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Karnataka', stateCode: 'KA', city: 'Bengaluru', pincodesCount: 248, tier: 'Tier 1', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Karnataka', stateCode: 'KA', city: 'Mysuru', pincodesCount: 62, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Karnataka', stateCode: 'KA', city: 'Hubballi-Dharwad', pincodesCount: 46, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Karnataka', stateCode: 'KA', city: 'Mangaluru', pincodesCount: 54, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Karnataka', stateCode: 'KA', city: 'Belagavi', pincodesCount: 36, tier: 'Tier 3', status: 'Active' },

  // Gujarat
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Gujarat', stateCode: 'GJ', city: 'Ahmedabad', pincodesCount: 194, tier: 'Tier 1', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Gujarat', stateCode: 'GJ', city: 'Surat', pincodesCount: 146, tier: 'Tier 1', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Gujarat', stateCode: 'GJ', city: 'Vadodara', pincodesCount: 88, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Gujarat', stateCode: 'GJ', city: 'Rajkot', pincodesCount: 68, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Gujarat', stateCode: 'GJ', city: 'Bhavnagar', pincodesCount: 42, tier: 'Tier 3', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Gujarat', stateCode: 'GJ', city: 'Gandhinagar', pincodesCount: 36, tier: 'Tier 2', status: 'Active' },

  // Rajasthan
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Rajasthan', stateCode: 'RJ', city: 'Jaipur', pincodesCount: 162, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Rajasthan', stateCode: 'RJ', city: 'Jodhpur', pincodesCount: 78, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Rajasthan', stateCode: 'RJ', city: 'Udaipur', pincodesCount: 56, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Rajasthan', stateCode: 'RJ', city: 'Kota', pincodesCount: 48, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Rajasthan', stateCode: 'RJ', city: 'Bikaner', pincodesCount: 38, tier: 'Tier 3', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Rajasthan', stateCode: 'RJ', city: 'Ajmer', pincodesCount: 42, tier: 'Tier 3', status: 'Active' },

  // Tamil Nadu
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Tamil Nadu', stateCode: 'TN', city: 'Chennai', pincodesCount: 210, tier: 'Tier 1', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Tamil Nadu', stateCode: 'TN', city: 'Coimbatore', pincodesCount: 94, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Tamil Nadu', stateCode: 'TN', city: 'Madurai', pincodesCount: 68, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Tamil Nadu', stateCode: 'TN', city: 'Tiruchirappalli', pincodesCount: 52, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Tamil Nadu', stateCode: 'TN', city: 'Salem', pincodesCount: 44, tier: 'Tier 3', status: 'Active' },

  // Madhya Pradesh
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Madhya Pradesh', stateCode: 'MP', city: 'Indore', pincodesCount: 118, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Madhya Pradesh', stateCode: 'MP', city: 'Bhopal', pincodesCount: 104, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Madhya Pradesh', stateCode: 'MP', city: 'Jabalpur', pincodesCount: 62, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Madhya Pradesh', stateCode: 'MP', city: 'Gwalior', pincodesCount: 54, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Madhya Pradesh', stateCode: 'MP', city: 'Ujjain', pincodesCount: 38, tier: 'Tier 3', status: 'Active' },

  // West Bengal
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'West Bengal', stateCode: 'WB', city: 'Kolkata', pincodesCount: 198, tier: 'Tier 1', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'West Bengal', stateCode: 'WB', city: 'Howrah', pincodesCount: 76, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'West Bengal', stateCode: 'WB', city: 'Durgapur', pincodesCount: 42, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'West Bengal', stateCode: 'WB', city: 'Asansol', pincodesCount: 48, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'West Bengal', stateCode: 'WB', city: 'Siliguri', pincodesCount: 38, tier: 'Tier 3', status: 'Active' },

  // Haryana
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Haryana', stateCode: 'HR', city: 'Gurugram', pincodesCount: 96, tier: 'Tier 1', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Haryana', stateCode: 'HR', city: 'Faridabad', pincodesCount: 74, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Haryana', stateCode: 'HR', city: 'Panipat', pincodesCount: 38, tier: 'Tier 3', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Haryana', stateCode: 'HR', city: 'Ambala', pincodesCount: 34, tier: 'Tier 3', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Haryana', stateCode: 'HR', city: 'Karnal', pincodesCount: 36, tier: 'Tier 3', status: 'Active' },

  // Punjab
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Punjab', stateCode: 'PB', city: 'Ludhiana', pincodesCount: 82, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Punjab', stateCode: 'PB', city: 'Amritsar', pincodesCount: 64, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Punjab', stateCode: 'PB', city: 'Jalandhar', pincodesCount: 56, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Punjab', stateCode: 'PB', city: 'Patiala', pincodesCount: 42, tier: 'Tier 3', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Punjab', stateCode: 'PB', city: 'Mohali', pincodesCount: 38, tier: 'Tier 2', status: 'Active' },

  // Bihar
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Bihar', stateCode: 'BR', city: 'Patna', pincodesCount: 112, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Bihar', stateCode: 'BR', city: 'Gaya', pincodesCount: 46, tier: 'Tier 3', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Bihar', stateCode: 'BR', city: 'Muzaffarpur', pincodesCount: 42, tier: 'Tier 3', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Bihar', stateCode: 'BR', city: 'Bhagalpur', pincodesCount: 38, tier: 'Tier 3', status: 'Active' },

  // Telangana
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Telangana', stateCode: 'TS', city: 'Hyderabad', pincodesCount: 224, tier: 'Tier 1', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Telangana', stateCode: 'TS', city: 'Warangal', pincodesCount: 48, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Telangana', stateCode: 'TS', city: 'Nizamabad', pincodesCount: 32, tier: 'Tier 3', status: 'Active' },

  // Andhra Pradesh
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Andhra Pradesh', stateCode: 'AP', city: 'Visakhapatnam', pincodesCount: 112, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Andhra Pradesh', stateCode: 'AP', city: 'Vijayawada', pincodesCount: 84, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Andhra Pradesh', stateCode: 'AP', city: 'Guntur', pincodesCount: 56, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Andhra Pradesh', stateCode: 'AP', city: 'Tirupati', pincodesCount: 38, tier: 'Tier 3', status: 'Active' },

  // Kerala
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Kerala', stateCode: 'KL', city: 'Kochi', pincodesCount: 92, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Kerala', stateCode: 'KL', city: 'Thiruvananthapuram', pincodesCount: 86, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Kerala', stateCode: 'KL', city: 'Kozhikode', pincodesCount: 64, tier: 'Tier 2', status: 'Active' },

  // Odisha
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Odisha', stateCode: 'OD', city: 'Bhubaneswar', pincodesCount: 78, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Odisha', stateCode: 'OD', city: 'Cuttack', pincodesCount: 54, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Odisha', stateCode: 'OD', city: 'Rourkela', pincodesCount: 42, tier: 'Tier 3', status: 'Active' },

  // Jharkhand
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Jharkhand', stateCode: 'JH', city: 'Ranchi', pincodesCount: 74, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Jharkhand', stateCode: 'JH', city: 'Jamshedpur', pincodesCount: 68, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Jharkhand', stateCode: 'JH', city: 'Dhanbad', pincodesCount: 52, tier: 'Tier 2', status: 'Active' },

  // Chhattisgarh
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Chhattisgarh', stateCode: 'CG', city: 'Raipur', pincodesCount: 82, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Chhattisgarh', stateCode: 'CG', city: 'Bhilai', pincodesCount: 56, tier: 'Tier 2', status: 'Active' },

  // Assam
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Assam', stateCode: 'AS', city: 'Guwahati', pincodesCount: 76, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Assam', stateCode: 'AS', city: 'Silchar', pincodesCount: 32, tier: 'Tier 3', status: 'Active' },

  // Uttarakhand
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Uttarakhand', stateCode: 'UK', city: 'Dehradun', pincodesCount: 68, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Uttarakhand', stateCode: 'UK', city: 'Haridwar', pincodesCount: 44, tier: 'Tier 3', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Uttarakhand', stateCode: 'UK', city: 'Roorkee', pincodesCount: 32, tier: 'Tier 3', status: 'Active' },

  // Himachal Pradesh
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Himachal Pradesh', stateCode: 'HP', city: 'Shimla', pincodesCount: 38, tier: 'Tier 3', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Himachal Pradesh', stateCode: 'HP', city: 'Baddi', pincodesCount: 28, tier: 'Tier 3', status: 'Active' },

  // Goa
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Goa', stateCode: 'GA', city: 'Panaji', pincodesCount: 32, tier: 'Tier 3', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Goa', stateCode: 'GA', city: 'Margao', pincodesCount: 28, tier: 'Tier 3', status: 'Active' },

  // Chandigarh
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Chandigarh', stateCode: 'CH', city: 'Chandigarh', pincodesCount: 56, tier: 'Tier 2', status: 'Active' },

  // Jammu & Kashmir
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Jammu & Kashmir', stateCode: 'JK', city: 'Jammu', pincodesCount: 48, tier: 'Tier 2', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Jammu & Kashmir', stateCode: 'JK', city: 'Srinagar', pincodesCount: 54, tier: 'Tier 2', status: 'Active' },

  // Other Indian States to complete 28 States representation
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Tripura', stateCode: 'TR', city: 'Agartala', pincodesCount: 36, tier: 'Tier 3', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Manipur', stateCode: 'MN', city: 'Imphal', pincodesCount: 28, tier: 'Tier 3', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Meghalaya', stateCode: 'ML', city: 'Shillong', pincodesCount: 32, tier: 'Tier 3', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Nagaland', stateCode: 'NL', city: 'Kohima', pincodesCount: 24, tier: 'Tier 3', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Sikkim', stateCode: 'SK', city: 'Gangtok', pincodesCount: 22, tier: 'Tier 3', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Mizoram', stateCode: 'MZ', city: 'Aizawl', pincodesCount: 26, tier: 'Tier 3', status: 'Active' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Arunachal Pradesh', stateCode: 'AR', city: 'Itanagar', pincodesCount: 24, tier: 'Tier 3', status: 'Active' },
]

export const seedLocations = async () => {
  try {
    const uri = process.env.MONGODB_URI
    if (!uri) {
      console.log('❌ MONGODB_URI not found in env')
      return
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri)
    }

    console.log('🌱 Checking Locations in MongoDB Atlas...')
    const count = await Location.countDocuments()
    if (count > 0) {
      console.log(`ℹ️ Locations already present (${count} records). Refreshing dataset...`)
      await Location.deleteMany({})
    }

    const inserted = await Location.insertMany(defaultLocations)
    console.log(`✅ Successfully seeded ${inserted.length} location records across India!`)

    const distinctStates = await Location.distinct('state')
    console.log(`📍 Total States: ${distinctStates.length} states seeded.`)

    return inserted
  } catch (err) {
    console.error('❌ Error seeding locations:', err)
  }
}

// Run standalone if called directly
if (process.argv[1]?.endsWith('seedLocations.js')) {
  seedLocations().then(() => {
    mongoose.disconnect()
    process.exit(0)
  })
}
