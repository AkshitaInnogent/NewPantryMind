import Swal from 'sweetalert2';

export const showAlert = {
  confirm: (title, text, confirmText = 'Yes', cancelText = 'Cancel') => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1fa74a',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmText,
      cancelButtonText: cancelText
    });
  },
  
  success: (title, text) => {
    return Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonColor: '#1fa74a'
    });
  },
  
  error: (title, text) => {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonColor: '#1fa74a'
    });
  },
  
  delete: (itemName) => {
    return Swal.fire({
      title: 'Are you sure?',
      text: `You won't be able to recover ${itemName}!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });
  }
};