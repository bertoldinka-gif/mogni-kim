const handleRestoreFromCode = () => {
  setRestoreError(null);

  if (!backupCode.trim()) {
    setRestoreError('Вставьте код восстановления.');
    return;
  }

  const result = importProfileBackupCode(backupCode);
  if (result.error) {
    setRestoreError(result.error);
    return;
  }

  if (result.user) {
    // Профиль уже сохранён в localStorage и поставлен в очередь на синхронизацию с YDB
    // внутри importProfileBackupCode. Переводим пользователя в тренажёр.
    onAuthenticated(result.user);
  }
};
