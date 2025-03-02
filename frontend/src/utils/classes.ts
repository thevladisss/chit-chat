import {useMemo} from "preact/compat";

type Class = string | string[] | Record<string, boolean>
export const buildClasses = (...classes: Class[]) => {
  return useMemo(() => {

    const classesArray =  classes.reduce((accum: string[], classes) => {
      if (typeof classes === "object") {
        if (Array.isArray(classes)) {
          classes.forEach((c) => {
            accum.push(c)
          })
        }
        else {
          Object.entries(classes).forEach(([c, enabled]) => {
            if (enabled) accum.push(c)
          })
        }
      }
      else {
        accum.push(classes)
      }

      return accum;
    }, []) as string[];

    return classesArray.join(' ')
  }, [classes])
}
