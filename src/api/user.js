import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data,
  })
}

export function getLoginUser() {
  return request({
    url: '/getLoginUser',
    method: 'post',
  })
}

export function logout() {
  return request({
    url: '/logout',
    method: 'post',
  })
}

export function getuserByOrgId() {
  return request({
    url: '/sysUser/getuserByOrgId',
    method: 'post',
  })
}
