/**
 * Created by feichongzheng on 17/9/28.
 */
import { call, put, takeLatest } from 'redux-saga/effects';
import {api} from '../../resource';
import * as actions from './actions';
import {actions as orgStructureActions} from '../orgStructure';
import {actions as unitInfoActions} from '../unitInfo';
import {UnifyType} from '../constants';
import {FIND_BY_ID_FOR_UNIFY_ORG, UPDATE_FOR_UNIFY_ORG} from './actionTypes';

import {log} from '../../../resource';

const {findById, update} = api.org;

function findOrgById(id) {
    const promise = findById({id: id});
    return promise.then((res) => res.json())
            .then((res) => res)
            .catch( (err) => {
                throw err;
            });
}

function updateOrg(org) {
    const promise = update(org);
    return promise.then((res) => res.json())
        .then((res) => res)
        .catch( (err) => {
            throw err;
        });
}

function* fetchOrg(data) {
    const {id} = data;
    try {
        yield put(actions.findByIdForUnifyOrgFetch());
        const result = yield call(findOrgById, id);
        yield put(actions.findByIdForUnifyOrgSuccess(result));
        if (result.success) {
            const {name} = result.data;
            yield put(unitInfoActions.changeForUnitInfo(UnifyType.ORG, '机构【' + name + '】'));
        }
    } catch (e) {
        yield put(actions.findByIdForUnifyOrgError(e));
    }
}

function* fetchUpdate(data) {
    const {org} = data;
    const startTime = new Date().getTime();
    try {
        yield put(actions.updateForUnifyOrgFetch());
        const result = yield call(updateOrg, org);
        yield put(actions.updateForUnifyOrgSuccess(result));
        if (result.success) {
            const desc = '更新机构->【ID：'+org.id+'，名称：'+org.name+'，地址：'
                +org.address+'，电话：'+org.phone+'，排序号：'+org.orderNum
                +'，父级：'+org.parent.id+'】';
            log.saveAction(api.org.relativePath.update, desc, new Date().getTime()-startTime, 200);
            const {name} = result.data;
            yield put(actions.showUpdatePageForUnifyOrg(false));
            yield put(orgStructureActions.findOrgStructureInTree({}, false));
            yield put(unitInfoActions.changeForUnitInfo(UnifyType.ORG, '机构【' + name + '】'));
        }
    } catch (e) {
        yield put(actions.updateForUnifyOrgError(e));
    }
}

function* sagas() {
    yield takeLatest(FIND_BY_ID_FOR_UNIFY_ORG, fetchOrg);
    yield takeLatest(UPDATE_FOR_UNIFY_ORG, fetchUpdate);
}

export default sagas;
