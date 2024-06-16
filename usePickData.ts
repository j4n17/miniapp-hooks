import { useEffect, useRef } from 'react';

interface IProps<T> {
  /* 判断item在list中的索引跟是否被选中状态 */
  computedIndex: (item: T, list: T[]) => { index: number; isSelected: boolean };
  /* 默认选中的项 */
  defaultSelectedData?: T[];
  /* 是否多选模式 */
  multiple?: boolean;
  /* 选择项更新 */
  onUpdata?: (list: T[]) => void;
}

const useSelectedData = <T>(props: IProps<T>) => {
  const { multiple = true, computedIndex, defaultSelectedData = [], onUpdata } = props;
  const dataRef = useRef<T[]>(defaultSelectedData);

  useEffect(() => {
    dataRef.current = defaultSelectedData;
  }, [defaultSelectedData]);

  const onClick = (item: T) => {
    const { index, isSelected } = computedIndex(item, dataRef.current);

    let _s = [...dataRef.current];

    if (multiple) {
      if (!isSelected) {
        _s = [..._s, item];
      } else {
        _s.splice(index, 1);
      }
    } else {
      if (!isSelected) {
        _s = [item];
      } else {
        _s = [];
      }
    }

    onUpdata?.(_s);
  };

  return {
    onItemClick: onClick
  };
};
export default useSelectedData;
