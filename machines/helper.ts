import { MachineOptions, EventObject } from 'xstate'

export const mergeMachineOptions = <TContext, TEvent extends EventObject>(
  machineOptions: Partial<MachineOptions<TContext, TEvent>>[]
): Partial<MachineOptions<TContext, TEvent>> => {
  let masterConfig: Partial<MachineOptions<TContext, TEvent>> = {}
  machineOptions.forEach((config) => {
    ;(masterConfig.actions = {
      ...masterConfig.actions,
      ...config.actions,
    }),
      (masterConfig.activities = {
        ...masterConfig.activities,
        ...config.activities,
      }),
      (masterConfig.delays = {
        ...masterConfig.delays,
        ...config.delays,
      }),
      (masterConfig.guards = {
        ...masterConfig.guards,
        ...config.guards,
      }),
      (masterConfig.services = {
        ...masterConfig.services,
        ...config.services,
      })
  })
  return masterConfig
}
