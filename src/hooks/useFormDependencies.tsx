import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export namespace NSuseFormDependencies {
  export interface IAllValues {
    [x: string]: any
  }
  export interface IFormDependencies {
    dependencies: Array<string | string[]>
    allValues: IAllValues
    // changedValues: IAllValues
    onDepChange?: (dependencies: IAllValues) => void
    // eslint-disable-next-line no-undef
    children: (dependencies: IAllValues) => JSX.Element
  }
}

export default function useFormDependencies (comput?: (changedValues: NSuseFormDependencies.IAllValues, allValues: NSuseFormDependencies.IAllValues) => any) {
  const [allValues, setAllValues] = useState<NSuseFormDependencies.IAllValues>({})
  // const allValuesRef = useRef<NSuseFormDependencies.IAllValues>({})
  const [computed, setComputed] = useState({})
  // const [changedValues, setChangedValues] = useState<NSuseFormDependencies.IAllValues>({})

  const onValuesChange = useCallback((changedValues: NSuseFormDependencies.IAllValues, allValues: NSuseFormDependencies.IAllValues) => {
    // setChangedValues(changedValues)
    setAllValues(allValues)
    // allValuesRef.current = allValues
    comput && setComputed(comput(changedValues, allValues))
  }, [])

  // const HOCFormDependenciesRender = useRef<any>()

  const HOCFormDependencies = useMemo(() => (props: Omit<NSuseFormDependencies.IFormDependencies, 'allValues'>) => (<FormDependencies
    // changedValues={changedValues}
    allValues={allValues}
    {...props}
  />), [])

  // const HOCFormDependencies = useMemo(() => ({ dependencies, onDepChange, children }: Omit<NSuseFormDependencies.IFormDependencies, 'allValues'>) => {
  //   const values = useMemo(() => Object.entries(allValues).reduce((r, [k, v]) => {
  //     const deps = dependencies.map((d) => Array.isArray(d) ? d[0] : d)
  //     if (deps.includes(k)) {
  //       r[k] = v
  //     }
  //     return r
  //   }, {} as NSuseFormDependencies.IAllValues), [allValues, dependencies])

  //   if (values) {
  //     values
  //   }

  //   useEffect(() => {
  //     console.log('onDepChange', dependencies, values)
  //     onDepChange?.(values)
  //   }, [values])

  //   HOCFormDependenciesRender.current = children(values)

  //   return HOCFormDependenciesRender.current
  // }, [allValues])

  const onDepsChangeRender = useCallback((render: (allValues:NSuseFormDependencies.IAllValues) => any) => {
    return render(allValues)
  }, [allValues])

  return {
    FormDependencies: HOCFormDependencies,
    onDepsChangeRender,
    onValuesChange,
    computed,
  }
}

function FormDependencies ({ allValues, dependencies, onDepChange, children }: NSuseFormDependencies.IFormDependencies) {
  // const [change, setChange] = useState(0)
  const HOCFormDependenciesRender = useRef<any>()
  const HOCFormDependenciesValues = useRef<any>({})
  const values = useMemo(() => Object.entries(allValues).reduce((r, [k, v]) => {
    const deps = dependencies.map((d) => Array.isArray(d) ? d[0] : d)
    if (deps.includes(k)) {
      r[k] = v
    }
    return r
  }, {} as NSuseFormDependencies.IAllValues), [allValues, dependencies])

  useEffect(() => {
    console.log(JSON.stringify(values), HOCFormDependenciesValues.current)
    if (JSON.stringify(values) !== HOCFormDependenciesValues.current) {
      console.log('onDepChange', dependencies, values)
      onDepChange?.(values)
    }
  }, [values])

  if (JSON.stringify(values) === HOCFormDependenciesValues.current) {
    return HOCFormDependenciesRender.current
  }

  HOCFormDependenciesValues.current = JSON.stringify(values)

  // useEffect(() => {
  //   if (dependencies.some((dep) => changedValues[dep])) {
  //     setChange(Math.random())
  //   }
  // }, [])

  HOCFormDependenciesRender.current = children(values)

  return HOCFormDependenciesRender.current
}
