export const APP_ROUTES = {
    base: '',
    create: 'create',
    update: ':appId/update',
    view: ':appId',
};

export const APP_VIEW_ROUTES = {
    viewNewIdentifierMapping: 'new',
    viewSettings: ':identifierId/settings',
    viewSettings2: 'settings',
    viewSetting: ':identifierId/settings/:settingId',
    viewConfiguration: ':identifierId/configuration',
    viewCreateSetting: ':identifierId/settings/new',
    viewUpdateSetting: ':identifierId/settings/:settingId/update',
    viewCopySettingTo: ':identifierId/settings/:settingId/copyTo',
    viewSettingHistories: ':identifierId/settings/:settingId/histories',
    viewSettingHistory: ':identifierId/settings/:settingId/histories/:historyId',
    viewInstances: ':identifierId/instances',
    viewInstances2: 'instances',
    viewInstance: ':identifierId/instances/:instanceId'
};

export type APP_VIEW_ROUTES_TYPE =
    'viewNewIdentifierMapping' |
    'viewSettings' |
    'viewSetting' |
    'viewCreateSetting' |
    'viewUpdateSetting' |
    'viewCopySettingTo' |
    'viewSettingHistories' |
    'viewSettingHistory' |
    'viewInstances' |
    'viewInstance' |
    'viewConfiguration' ;