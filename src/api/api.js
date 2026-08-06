import request from '@/utils/request'

export function getGradeList(data = {}) {
  return request({
    url: '/grade/getGradeList',
    method: 'post',
    data,
  })
}

export function studentPage(data) {
  return request({
    url: '/student/studentPage',
    method: 'post',
    data,
  })
}
