const _AppGroupsBase = '/v1/app-groups';
const _AppInstancesBase = '/v1/app-instances';
const _AppsBase = '/v1/apps';
const _AppSettingHistoriesBase = '/v1/app-setting-histories';
const _AppSettingsBase = '/v1/app-settings';
const _AppTagsBase = '/v1/app-tags';
const _AuthBase = '/v1/auth';
const _IdentifiersBase = '/v1/identifiers';
const _LicensesBase = '/v1/licenses';
const _LocalSettingsBase = '/v1/local-settings';
const _NotificationsBase = '/v1/notifications';
const _OpenSettingsBase = '/v1/open-settings';
const _ProviderBase = '/v1/provider';
const _TokenBase = '/v1/token';
const _UsersBase = '/v1/users';

export const OpenSettingsDefaults = {
    Routes: {
        V1: {
            AppGroupsEndpoints: {
                base: () => _AppGroupsBase,
                getAppGroups: () => _AppGroupsBase,
                createAppGroup: () => _AppGroupsBase,
                getPaginatedAppGroups: () => _AppGroupsBase + '/paginated',
                getAppGroupById: (appGroupId: string | number) => _AppGroupsBase + `/${appGroupId}`,
                getAppGroupBySlug: (appGroupSlug: string) => _AppGroupsBase + `/slug/${appGroupSlug}`,
                updateAppGroup: (appGroupId: string | number) => _AppGroupsBase + `/${appGroupId}`,
                updateAppGroupSortOrder: (appGroupId: string | number) => _AppGroupsBase + `/${appGroupId}/sort-order`,
                dragAppGroup: (sourceId: string | number, targetId: string | number) => _AppGroupsBase + `/${sourceId}/drag/${targetId}`,
                reorderAppGroup: () => _AppGroupsBase + '/reorder',
                deleteAppGroup: (appGroupId: string | number) => _AppGroupsBase + `/${appGroupId}`,
                deleteUnmappedAppGroups: () => _AppGroupsBase + '/unmapped'
            },
            AppInstancesEndpoints: {
                base: () => _AppInstancesBase,
                deleteAppInstance: (appInstanceId: string | number) => _AppInstancesBase + `/${appInstanceId}`
            },
            AppsEndpoints: {
                base: () => _AppsBase,
                getApps: () => _AppsBase,
                createApp: () => _AppsBase,
                getGroupedApps: () => _AppsBase + '/grouped',
                fetchAppData: (clientId: string, identifierName: string) => _AppsBase + `/${clientId}/identifiers/${identifierName}/fetch-data`,
                syncAppData: (clientId: string, identifierName: string) => _AppsBase + `/${clientId}/identifiers/${identifierName}/sync-data`,
                getAppById: (appId: string | number) => _AppsBase + `/${appId}`,
                getAppBySlug: (appSlug: string) => _AppsBase + `/slug/${appSlug}`,
                updateApp: (appId: string | number) => _AppsBase + `/${appId}`,
                deleteApp: (appId: string | number) => _AppsBase + `/${appId}`,
                getGroupedAppDataByAppId: (appId: string | number) => _AppsBase + `/${appId}/grouped`,
                getGroupedAppDataByAppSlug: (appSlug: string) => _AppsBase + `/slug/${appSlug}/grouped`,
                getAppInstancesByAppId: (appId: string | number) => _AppsBase + `/${appId}/instances`,
                getAppInstancesByAppSlug: (appSlug: string) => _AppsBase + `/slug/${appSlug}/instances`,
                createAppInstance: (clientId: string) => _AppsBase + `/${clientId}/instances`,
                updateAppInstance: (clientId: string) => _AppsBase + `/${clientId}/instances`,
                getRegisteredApp: (clientId: string) => _AppsBase + `/${clientId}/registered`,
                getAppIdentifierMappingsByAppId: (appId: string | number) => _AppsBase + `/${appId}/identifiers`,
                getAppIdentifierMappingsByAppSlug: (appSlug: string) => _AppsBase + `/slug/${appSlug}/identifiers`,
                createAppIdentifierMapping: (appId: string | number) => _AppsBase + `/${appId}/identifiers`,
                getAppIdentifierMappingByAppIdAndIdentifierId: (appId: string | number, identifierId: string | number) => _AppsBase + `/${appId}/identifiers/${identifierId}`,
                getAppIdentifierMappingByAppSlugAndIdentifierSlug: (appSlug: string, identifierSlug: string) => _AppsBase + `/slug/${appSlug}/identifiers/${identifierSlug}`,
                getAppConfigurationByAppIdAndIdentifierId: (appId: string | number, identifierId: string | number) => _AppsBase + `/${appId}/identifiers/${identifierId}/configuration`,
                patchAppConfiguration: (appId: string | number, identifierId: string | number) => _AppsBase + `/${appId}/identifiers/${identifierId}/configuration`,
                deleteAppIdentifierMapping: (appId: string | number, identifierId: string | number) => _AppsBase + `/${appId}/identifiers/${identifierId}`,
                getAppInstancesByAppIdAndIdentifierId: (appId: string | number, identifierId: string | number) => _AppsBase + `/${appId}/identifiers/${identifierId}/instances`,
                getAppInstancesByAppSlugAndIdentifierSlug: (appSlug: string, identifierSlug: string) => _AppsBase + `/slug/${appSlug}/identifiers/${identifierSlug}/instances`,
                getAppSettingsByAppIdAndIdentifierId: (appId: string | number, identifierId: string | number) => _AppsBase + `/${appId}/identifiers/${identifierId}/settings`,
                getAppSettingsByAppSlugAndIdentifierSlug: (appSlug: string, identifierSlug: string) => _AppsBase + `/slug/${appSlug}/identifiers/${identifierSlug}/settings`,
                updateAppIdentifierMappingSortOrder: (appId: string | number, identifierId: string | number) => _AppsBase + `/${appId}/identifiers/${identifierId}/sort-order`,
                getGroupedAppDataByAppIdAndIdentifierId: (appId: string | number, identifierId: string | number) => _AppsBase + `/${appId}/identifiers/${identifierId}/grouped`,
                getGroupedAppDataByAppSlugAndIdentifierSlug: (appSlug: string, identifierSlug: string) => _AppsBase + `/slug/${appSlug}/identifiers/${identifierSlug}/grouped`,
                getAppSettingsData: (appId: string | number) => _AppsBase + `/${appId}/settings/data`
            },
            AppSettingHistoriesEndpoints: {
                Base: () => _AppSettingHistoriesBase,
                getAppSettingHistoryData: (appSettingHistoryId: string | number) => _AppSettingHistoriesBase + `/${appSettingHistoryId}/data`,
                getAppSettingHistoryById: (appSettingHistoryId: string | number) => _AppSettingHistoriesBase + `/${appSettingHistoryId}`,
                getAppSettingHistoryBySlug: (appSettingHistorySlug: string) => _AppSettingHistoriesBase + `/slug/${appSettingHistorySlug}`,
                restoreAppSettingHistory: (appSettingHistoryId: string | number) => _AppSettingHistoriesBase + `/${appSettingHistoryId}/restore`
            },
            AppSettingsEndpoints: {
                Base: () => _AppSettingsBase,
                createAppSetting: () => _AppSettingsBase,
                getAppSettingsLastUpdatedComputedIdentifiers: () => _AppSettingsBase + '/latest-updates',
                getAppSettingById: (appSettingId: string | number) => _AppSettingsBase + `/${appSettingId}`,
                updateAppSetting: (appSettingId: string | number) => _AppSettingsBase + `/${appSettingId}`,
                deleteAppSetting: (appSettingId: string | number) => _AppSettingsBase + `/${appSettingId}`,
                getAppSettingHistories: (appSettingId: string | number) => _AppSettingsBase + `/${appSettingId}/histories`,
                copyAppSettingTo: (appSettingId: string | number) => _AppSettingsBase + `/${appSettingId}/copy`,
                getAppSettingData: (appSettingId: string | number) => _AppSettingsBase + `/${appSettingId}/data`,
                updateAppSettingData: (appSettingId: string | number) => _AppSettingsBase + `/${appSettingId}/data`
            },
            AppTagsEndpoints: {
                base: () => _AppTagsBase,
                getAppTags: () => _AppTagsBase,
                createAppTag: () => _AppTagsBase,
                getPaginatedAppTags: () => _AppTagsBase + '/paginated',
                deleteUnmappedAppTags: () => _AppTagsBase + '/unmapped',
                getAppTagById: (appTagId: string | number) => _AppTagsBase + `/${appTagId}`,
                getAppTagBySlug: (appTagSlug: string) => _AppTagsBase + `/slug/${appTagSlug}`,
                updateAppTag: (appTagId: string | number) => _AppTagsBase + `/${appTagId}`,
                deleteAppTag: (appTagId: string | number) => _AppTagsBase + `/${appTagId}`,
                updateAppTagSortOrder: (appTagId: string | number) => _AppTagsBase + `/${appTagId}/sort-order`,
                dragAppTag: (sourceId: string | number, targetId: string | number) => _AppTagsBase + `/${sourceId}/drag/${targetId}`,
                reorderAppTag: () => _AppTagsBase + '/reorder'
            },
            AuthEndpoints: {
                base: () => _AuthBase,
                getMe: () => _AuthBase + '/me',
                login: () => _AuthBase + '/login',
                logout: () => _AuthBase + '/logout'
            },
            IdentifiersEndpoints: {
                base: () => _IdentifiersBase,
                getIdentifiers: () => _IdentifiersBase,
                createIdentifier: () => _IdentifiersBase,
                getPaginatedIdentifiers: () => _IdentifiersBase + '/paginated',
                deleteUnmappedIdentifiers: () => _IdentifiersBase + '/unmapped',
                getIdentifierById: (identifierId: string | number) => _IdentifiersBase + `/${identifierId}`,
                getIdentifierBySlug: (identifierSlug: string) => _IdentifiersBase + `/slug/${identifierSlug}`,
                updateIdentifier: (identifierId: string | number) => _IdentifiersBase + `/${identifierId}`,
                deleteIdentifier: (identifierId: string | number) => _IdentifiersBase + `/${identifierId}`,
                updateIdentifierSortOrder: (identifierId: string | number) => _IdentifiersBase + `/${identifierId}/sort-order`,
                dragIdentifier: (sourceId: string | number, targetId: string | number) => _IdentifiersBase + `/${sourceId}/drag/${targetId}`,
                reorderIdentifiers: () => _IdentifiersBase + '/reorder'
            },
            LicensesEndpoints: {
                base: () => _LicensesBase,
                getPaginatedLicenses: () => _LicensesBase + '/paginated',
                getCurrentLicense: () => _LicensesBase + '/current',
                saveLicense: () => _LicensesBase,
                deleteLicense: (referenceId: string | number) => _LicensesBase + `/${referenceId}`
            },
            LocalSettingsEndpoints: {
                base: () => _LocalSettingsBase,
                getLocalSettings: (computedIdentifier: string) => _LocalSettingsBase + `/${computedIdentifier}`
            },
            NotificationsEndpoints: {
                base: () => _NotificationsBase,
                getNotifications: () => _NotificationsBase,
                getUserNotifications: (userId: string) => _NotificationsBase + `/users/${userId}`,
                createNotification: () => _NotificationsBase,
                markNotificationsAsOpened: (userId: string) => _NotificationsBase + `/users/${userId}/open`,
                markNotificationAsViewed: (notificationId: string, userId: string) => _NotificationsBase + `/${notificationId}/users/${userId}/view`,
                markNotificationAsDismissed: (notificationId: string, userId: string) => _NotificationsBase + `/${notificationId}/users/${userId}/dismiss`,
                dispatchNotificationsToUsers: (notificationId: string) => _NotificationsBase + `/${notificationId}/users/dispatch`
            },
            OpenSettingsEndpoints: {
                base: () => _OpenSettingsBase,
                getConfigs: () => _OpenSettingsBase + '/configs',
                getConfigData: (configName: string) => _OpenSettingsBase + `/configs-data/${configName}`
            },
            ProviderEndpoints: {
                base: () => _ProviderBase,
                getProvider: () => _ProviderBase,
                getPrimaryProvider: () => _ProviderBase + '/primary'
            },
            TokenEndpoints: {
                base: () => _TokenBase,
                generateTokenForMachine: () => _TokenBase + '/machine',
                getPublicJwks: () => _TokenBase + '/jwks'
            },
            UsersEndpoints: {
                base: () => _UsersBase,
                createUser: () => _UsersBase,
                getPaginatedUsers: () => _UsersBase + '/paginated',
                getUserById: (userId: string | number) => _UsersBase + `/${userId}`,
                getUserBySlug: (userSlug: string) => _UsersBase + `/slug/${userSlug}`,
                updateUser: (userId: string | number) => _UsersBase + `/${userId}`,
                deleteUser: (userId: string | number) => _UsersBase + `/${userId}`
            }
        }
    }
} as const;