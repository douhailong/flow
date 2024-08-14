export const removeBothEndsSpace = (str: string): string | undefined => {
  // str?.trim() ? str.trim() : 'empty string';
  const type = typeof str;
  // return type === 'string' && str?.trim() ? str.trim() : undefined;
  return type !== 'string' ? str : str?.trim() ? str.trim() : undefined;
};

export const adapteObject = <T extends object, K extends Function>(
  targetObject: T,
  tackleFunction: K
): T => {
  const retObject: Record<string, string> = {};
  Object.keys(targetObject).forEach((key) => {
    retObject[key] = tackleFunction((targetObject as any)[key]);
  });
  return retObject as T;
};

export const buildId = (id: number, prefixs: string): string => {
  return prefixs + String(id).padStart(6, '0');
};

export const getWeek = (date: number): string => {
  const weekArray = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekArray[date];
};

export const getId = (props: string): number => {
  const strArr = props.split('');
  function getIndex() {
    for (let i = 0; i < strArr.length; i++) {
      const curStr = strArr[i];
      if (curStr !== 'S' && curStr !== 'K' && curStr !== 'A' && curStr !== '0') {
        return i;
      }
    }
  }
  const ret = Number(strArr.slice(getIndex()).join(''));
  return ret;
};

export const getImageUrl = async (file: File) => {
  return URL.createObjectURL(
    new Blob([await file.arrayBuffer()], {
      type: 'image/jpg, image/png, image/jpeg'
    })
  );
};
