const optional = (type: string) => ({ type, optional: true });
const _enum = (values: any[]) => ({ type: 'enum', values });

export { optional, _enum };
