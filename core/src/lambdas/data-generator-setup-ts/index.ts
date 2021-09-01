export async function handler(event: any) {
  console.log(event);
  const offset = event.Offset;
  const frequency = event.Frequency as number;
  const statement = event.Statement;
  const now = new Date();
  const min = now;
  const max = now;
  min.setSeconds(min.getSeconds() - frequency + offset as number);
  max.setSeconds(now.getSeconds() - offset as number);
  const newStatement = statement.replaceAll('{{OFFSET}}', offset).replaceAll('{{MIN}}', min.toISOString).replaceAll('{{MAX}}', max.toISOString);
  console.log(newStatement);
  return newStatement;
}
