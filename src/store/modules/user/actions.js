import { loginApi } from '@/service'
import * as MutationTypes from './mutation-types'
import { removeToken, setToken } from '@/utils/auth'

export default {
  getUserInfo ({ commit, state }) {
    return new Promise(async (resolve, reject) => {
      // 调用Api获取用户角色
      try {
        // 获取角色
        // const { roleList } = await loginApi.GetUserRole()
        // const roles = roleList instanceof Array ? [...roleList] : [roleList]
        const roles = ['admin']
        commit(MutationTypes.SET_USER_ROLES, roles)
        const { realName, email } = await loginApi.getUserInfo()
        const { userName } = state.userInfo
        console.log(state)
        const token = state.userInfo.token
        commit(MutationTypes.SET_USER_INFO, {
          userName,
          realName,
          email,
          token
        })
        resolve(roles)
      } catch (err) {
        reject(err)
      }
    })
  },

  // 前端 登出
  fedLogOut ({ commit }) {
    return new Promise((resolve) => {
      commit(MutationTypes.SET_TOKEN, '')
      removeToken()
      resolve()
    })
  },

  logOut ({ commit }) {
    return new Promise((resolve, reject) => {
      commit(MutationTypes.SET_TOKEN, '')
      commit(MutationTypes.SET_USER_ROLES, [])
      removeToken()
      resolve()
    })
  },

  logIn ({ commit }, userInfo) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(userInfo)
        const { token } = await loginApi.checkLogin(userInfo)
        const userName = userInfo.userName

        if (token) {
          commit(MutationTypes.SET_TOKEN, token)
          commit(MutationTypes.SET_USER_INFO, { userName, token })
          setToken(token, userInfo.remeberPwd ? 30 : null)
        }
        resolve(token)
      } catch (err) {
        reject(err)
      }
    })
  }
}