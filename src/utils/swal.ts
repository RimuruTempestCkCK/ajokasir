import Swal from 'sweetalert2';

// Toast Mixin for notifications at the top-right
export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

/**
 * Show a standard alert modal
 */
export const showAlert = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info') => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonColor: '#f43f5e', // Match theme primary (Rose)
    background: '#ffffff',
    color: '#0f172a',
    customClass: {
      confirmButton: 'btn btn-primary'
    }
  });
};

/**
 * Show a confirmation modal (Yes/No)
 */
export const showConfirm = (title: string, text: string, confirmText: string = 'Ya, Lanjutkan', cancelText: string = 'Batal') => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#f43f5e', // Rose
    cancelButtonColor: '#64748b',  // Slate
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    background: '#ffffff',
    color: '#0f172a',
    reverseButtons: true
  });
};

/**
 * Show a quick success toast notification
 */
export const showSuccessToast = (title: string) => {
  return Toast.fire({
    icon: 'success',
    title
  });
};

/**
 * Show a quick error toast notification
 */
export const showErrorToast = (title: string) => {
  return Toast.fire({
    icon: 'error',
    title
  });
};
