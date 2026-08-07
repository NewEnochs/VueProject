import type { Component } from 'vue'

export interface AppTab {
  path: string
  title: string
}

export interface MenuLeaf {
  path: string
  title: string
  icon?: Component
}

export interface MenuGroup {
  key: string
  title: string
  icon?: Component
  children: MenuLeaf[]
}

export interface TabContextMenu {
  visible: boolean
  x: number
  y: number
  path: string
}
