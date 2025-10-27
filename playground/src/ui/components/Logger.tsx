export const Logger: React.FC<{ args: unknown[] }> = (
  props,
): React.ReactNode => {
  console.log(props.args);
  return null;
};
Logger.displayName = "Logger";
