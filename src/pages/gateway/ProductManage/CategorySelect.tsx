import React, { useState, useRef } from 'react'
import { Select, SelectProps } from 'antd'
import { CategoryModal, CategoryModalRef } from './CategoryModal'

export interface CategorySelectProps<ValueType = any> extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  onCategoryKeyChange?: ((category_key: string) => void) | undefined
}

export const CategorySelect: React.FC<CategorySelectProps> = (props) => {
  const categoryModalRef = useRef<CategoryModalRef>(null)
  const [innerValue, setInnerValue] = useState<string>()
  const [options, setOptions] = useState<SelectProps['options']>()

  return (
    <>
      <CategoryModal
        ref={categoryModalRef}
        onChange={({ id, category_key, category_name }) => {
          setInnerValue(id)
          setOptions([{ label: category_name, value: id }])
          props.onChange?.(id, [])
          props.onCategoryKeyChange?.(category_key)
        }}
      />
      <Select
        {...props}
        open={false}
        options={options}
        value={innerValue}
        onFocus={() => {
          categoryModalRef.current?.open()
        }}
      />
    </>
  )
}

export default CategorySelect
