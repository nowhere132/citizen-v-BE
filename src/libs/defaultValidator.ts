import Validator from 'fastest-validator';

const defaultValidator = () => {
  const v = new Validator({
    defaults: {
      messages: {
        custom_date: "The '{field}' must be one of allowed DateTime formats.",
      },
    },
  });

  // MONGO_OBJECT_ID
  v.alias('MONGO_OBJECT_ID', {
    type: 'string',
    pattern: '^[a-fA-F0-9]{24}$',
    messages: {
      stringPattern: "The '{field}' must be valid Mongodb ObjectId.",
      string: "The '{field}' must be valid Mongodb ObjectId.",
    },
  });

  // YYYY-MM-DD hh:mm:ss
  v.alias('CUSTOM_DATETIME_1', {
    type: 'string',
    custom: (value: any) => {
      const formattedValue = `${value.replace(' ', 'T')}Z`;
      const isDate = !Number.isNaN(Date.parse(formattedValue));
      if (isDate) return true;
      return [{ type: 'custom_date', expected: 'YYYY-MM-DD hh:mm:ss', actual: value }];
    },
  });

  return v;
};

export default defaultValidator;
