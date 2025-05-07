type CellValue = string | number | boolean;

type RGBColor = { red: number; green: number; blue: number };

interface CellOptions {
  align?: 'CENTER' | 'LEFT' | 'RIGHT';
  fontSize?: number;
  bold?: boolean;
  foregroundColor?: RGBColor;
  backgroundColor?: RGBColor;
}

export const cellFn = (value: CellValue, options: CellOptions = {}) => {
  let userEnteredValue;

  if (typeof value === 'string') {
    userEnteredValue = value.startsWith('=')
      ? { formulaValue: value }
      : { stringValue: value };
  } else if (typeof value === 'number') {
    userEnteredValue = { numberValue: value };
  } else {
    userEnteredValue = { boolValue: value };
  }

  return {
    userEnteredValue,
    userEnteredFormat: {
      backgroundColor: options.backgroundColor,
      textFormat: {
        fontSize: options.fontSize ?? 12,
        fontFamily: 'Verdana',
        bold: options.bold ?? false,
        foregroundColor: options.foregroundColor,
      },
      horizontalAlignment: options.align ?? 'RIGHT',
    },
  };
};
