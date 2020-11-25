import { MachineOptions, EventObject } from 'xstate'

export const mergeMachineOptions = <TContext, TEvent extends EventObject>(
  machineOptions: Partial<MachineOptions<TContext, TEvent>>[]
): Partial<MachineOptions<TContext, TEvent>> => {
  return {
    actions: machineOptions
      .map((machineOptions) => machineOptions.actions)
      .reduce((actions, allActions) => ({ ...allActions, ...actions }), {}),
    activities: machineOptions
      .map((machineOptions) => machineOptions.activities)
      .reduce(
        (activities, allActivities) => ({ ...allActivities, ...activities }),
        {}
      ),
    delays: machineOptions
      .map((machineOptions) => machineOptions.delays)
      .reduce((delays, allDelays) => ({ ...allDelays, ...delays }), {}),
    guards: machineOptions
      .map((machineOptions) => machineOptions.guards)
      .reduce((guards, allGuards) => ({ ...allGuards, ...guards }), {}),
    services: machineOptions
      .map((machineOptions) => machineOptions.services)
      .reduce((services, allServices) => ({ ...allServices, ...services }), {}),
  }
  // return mergedOptions
  // machineOptions.forEach((config) => {
  //   ;(masterConfig.actions = {
  //     ...masterConfig.actions,
  //     ...config.actions,
  //   }),
  //     (masterConfig.activities = {
  //       ...masterConfig.activities,
  //       ...config.activities,
  //     }),
  //     (masterConfig.delays = {
  //       ...masterConfig.delays,
  //       ...config.delays,
  //     }),
  //     (masterConfig.guards = {
  //       ...masterConfig.guards,
  //       ...config.guards,
  //     }),
  //     (masterConfig.services = {
  //       ...masterConfig.services,
  //       ...config.services,
  //     })
  // })
  // return masterConfig
}
