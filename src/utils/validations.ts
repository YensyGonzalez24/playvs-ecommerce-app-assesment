import * as yup from 'yup';

export const productValidationSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().required('Price is required').positive('Price must be a positive number'),
  categoryId: yup.string().required('Category ID is required'),
});

export const categoryValidationSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
});

export const userValidationSchema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  name: yup.string().required('Name is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});
