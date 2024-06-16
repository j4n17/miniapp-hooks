/* 通用的滚动加载列表hooks, 并提供数据加载状态 */

import NoData from '@/components/no-data';
import { View } from '@tarojs/components';
import { useEffect, useState } from 'react';

interface ResponseList<T> {
  status: number;
  msg: string;
  data: {
    list: T[];
    total: number;
    [key: string]: any;
  };
}

type LoaderT<T> = (page: number, pageSize: number) => Promise<ResponseList<T>>;

interface IScrollList<T> {
  loader: LoaderT<T>;
  pageSize?: number;
  dataLoadingNode?: React.ReactElement;
  dataEndNode?: React.ReactElement;
  dataEmptyNode?: React.ReactElement;
}

export default <T = any,>({ loader, pageSize = 20, dataLoadingNode, dataEndNode, dataEmptyNode }: IScrollList<T>) => {
  const [listData, setListData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  /* 请求中 */
  const [loading, setLoading] = useState(false);
  /* 没有更多，无需请求 */
  const [hasMore, setHasMore] = useState<boolean>(true);
  /* 暂无数据 */
  const [noData, setNoData] = useState<boolean>(false);
  /* 是否出现到底了状态 */
  const [dataEnd, setDataEnd] = useState<boolean>(false);

  const beforeLoading = () => {
    setLoading(true);
    setNoData(false);
    setDataEnd(false);
    setHasMore(true);
  };

  const loadList = async (curPage: number, dataLoader = loader) => {
    beforeLoading();
    setCurrentPage(curPage);
    const res = await dataLoader(curPage, pageSize);
    if (res) {
      const { total, list = [] } = res.data;
      const l = list.length;

      if (total <= curPage * pageSize) {
        setHasMore(false);
      }

      if (l > 0 && l < pageSize) {
        setDataEnd(true);
      }

      if (curPage === 1) {
        setListData(list);

        if (l <= 0) {
          setNoData(true);
        }
      } else {
        setListData((_list) => [..._list, ...list]);
      }
    }
    setLoading(false);
  };

  const onScrollToLower = () => {
    if (!hasMore || loading) {
      return;
    }
    loadList(currentPage + 1);
  };

  const onRefresherRefresh = () => {
    loadList(1);
  };

  const onLoadList = (page: number, dataLoader?: LoaderT<T>) => {
    loadList(page, dataLoader);
  };

  useEffect(() => {
    loadList(1);
  }, []);

  return {
    loading,
    noData,
    onLoadList,
    onScrollToLower,
    onRefresherRefresh,
    list: listData,
    dataEnd,
    InteractionNode: (
      <View>
        {dataEnd ? dataEndNode ?? <NoMore /> : null}
        {noData ? dataEmptyNode ?? <Empty /> : null}
        {loading ? dataLoadingNode ?? <Loading /> : null}
      </View>
    )
  };
};

const NoMore = () => {
  return <View className='text-[#939DB9] text-xl text-center py-8'> - 没有更多了 - </View>;
};

const Loading = () => {
  return <View className='text-[#939DB9] text-xl text-center py-8'> 加载中... </View>;
};

const Empty = (props: { title?: string }) => {
  return (
    <View className='pt-28'>
      <NoData title={props.title} />
    </View>
  );
};
