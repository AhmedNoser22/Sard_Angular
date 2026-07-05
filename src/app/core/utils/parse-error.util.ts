export function parseHttpError(err: any): string {
  if (err.status === 0) return 'تعذر الاتصال بالخادم، تحقق من اتصالك';
  if (typeof err.error === 'string') return err.error;
  if (typeof err.error === 'object') {
    return err.error?.message
      ?? err.error?.Message
      ?? err.error?.title
      ?? err.error?.errors?.[0]
      ?? 'حدث خطأ، حاول مرة أخرى';
  }
  return 'حدث خطأ، حاول مرة أخرى';
}