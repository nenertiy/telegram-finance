export const cellFn = (value: string) => {
  const c = {
    userEnteredValue: { stringValue: value },
    userEnteredFormat: {
      textFormat: { fontSize: 14, fontFamily: 'Verdana' },
      horizontalAlignment: 'CENTER',
    },
  };

  return c;
};
