import React, { useMemo, useRef, useState } from 'react';

import { Select, Spin } from 'antd';
import debounce from 'lodash/debounce';
import type { SelectProps } from 'antd/es/select';
import { SearchOutlined } from '@ant-design/icons';

export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<ValueType[]>;
  debounceTimeout?: number;
}

function DebounceSelect<ValueType extends { key?: string; label: React.ReactNode; value: string | number } = any>({
  fetchOptions,
  debounceTimeout = 800,
  ...props
}: DebounceSelectProps<ValueType>) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<ValueType[]>([]);
  const fetchRef = useRef(0);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }
        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  return (
    <Select
      showSearch
      suffixIcon={<SearchOutlined />}
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={
        fetching ? (
          <div className="text-center">
            <Spin size="small" />
          </div>
        ) : null
      }
      {...props}
      options={options}
    />
  );
}

export default DebounceSelect;
