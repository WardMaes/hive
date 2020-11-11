import { MachineOptions, EventObject } from 'xstate'

export const mergeMachineOptions = <TContext, TEvent extends EventObject>(
  machineOptions: Partial<MachineOptions<TContext, TEvent>>[]
): Partial<MachineOptions<TContext, TEvent>> => {
  let masterConfig = {}
  machineOptions.forEach((config) => {
    masterConfig = {
      ...masterConfig,
      ...config,
    }
  })
  return masterConfig
}
