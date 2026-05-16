import { HttpInterceptorFn } from '@angular/common/http';
export const authInterceptor:
  HttpInterceptorFn = (req, next) => {
    /* PUBLIC AUTH APIS ONLY */
    const publicAuthApis = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/send-otp',
      '/api/auth/verify-otp',
      '/api/auth/register/init',
      '/api/auth/register/verify',
      '/api/auth/validate-token',
      '/api/auth/resend-link',
      '/api/auth/set-password'
    ];
    /* CHECK PUBLIC API */
    const isPublicApi = publicAuthApis.some(
      url => req.url.endsWith(url)
    );
    /* SKIP TOKEN */
    if (isPublicApi) {
      return next(req);
    }
    /* TOKEN */
    const token =
      localStorage.getItem('vt_token');
    /* ATTACH TOKEN */
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next(req);
  };