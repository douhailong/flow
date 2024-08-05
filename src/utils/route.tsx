import { resolvePath, useNavigate, useLocation } from 'react-router-dom';

import NotPermission from '@pages/403';
import { ErrorBoundary } from '@components';

// import {useAppSelector} from '@hooks'
import store from '@store';

import { RouteConfig, RouteConfigItem, baseRouter } from '@router/router';

export const routeAuthRet = (route: RouteConfigItem) => {
    const userInfo = store.getState().userReducer.userInfo;
    if (route.permission) {
        if (!route.permission.includes(userInfo.userRole)) {
            return false;
        }
        return true;
    }
    return true;
};

export const getInitialRoute = (router: RouteConfig): any => {
    for (let i = 0; i < router.length; i++) {
        const curRoute = router[i];
        if (routeAuthRet(curRoute)) {
            if (curRoute.children) {
                return getInitialRoute(
                    curRoute?.children?.map?.((item) => ({
                        ...item,
                        path: resolvePath(item.path || '', curRoute?.path)?.pathname
                    }))
                );
            } else if (curRoute.element) {
                return curRoute?.path;
            }
        }
    }
};

export const enhanceRouteElement = (router: RouteConfig): any => {
    return router.map((route) => {
        return {
            ...route,
            ...(route.element
                ? {
                      element: routeAuthRet(route) ? <ErrorBoundary>{route.element}</ErrorBoundary> : <NotPermission />
                  }
                : {}),
            ...(route.children ? { children: enhanceRouteElement(route.children) } : {})
        };
    });
};
