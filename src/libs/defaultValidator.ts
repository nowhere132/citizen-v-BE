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

  // NAME
  v.alias('NAME', {
    type: 'string',
    min: 1,
    max: 255,
    pattern: '^(?!.*<[^>]+>).*',
    messages: {
      stringPattern: "The '{field}' field must not include HTML tag.",
    },
  });
  // USERNAME
  v.alias('USERNAME', {
    type: 'string',
    min: 2,
    max: 50,
    pattern: '^[A-Za-z0-9_.]*$',
    messages: {
      stringPattern: "The '{field}' field must not include HTML tag.",
    },
  });
  // PASSWORD
  v.alias('PASSWORD', {
    type: 'string',
    min: 6,
    max: 20,
    pattern: '^(?!.*<[^>]+>).*',
    messages: {
      stringPattern: "The '{field}' field must not include HTML tag.",
    },
  });
  // PHONE_NO
  v.alias('PHONE_NO', {
    type: 'string',
    min: 2,
    max: 15,
    pattern: '^[0-9]*$',
    messages: {
      stringPattern: "The '{field}' field must include only number.",
    },
  });

  // > CUSTOM ALIASES
  v.alias('PERMISSION_BITS', {
    type: 'string',
    length: 4,
    pattern: '^[0-1]{4}$',
    messages: {
      string: "The '{field}' must follow permission bits format.",
    },
  });
  // < CUSTOM ALIASES

  return v;
};

export const validateTypes = {
  MONGO_OBJECT_ID: 'MONGO_OBJECT_ID',
  USERNAME: 'USERNAME',
  NAME: 'NAME',
  PASSWORD: 'PASSWORD',
  PHONE_NO: 'PHONE_NO',

  PERMISSION_BITS: 'PERMISSION_BITS',
};

export default defaultValidator;
