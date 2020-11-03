import React from 'react'
import { NavLink } from "react-router-dom";
import { Menu } from 'antd'
import { MENU } from '../../const/menu';

export default function MenuList() {
  const { Item } = Menu;
  return (
    <Menu
      style={{ width: 256, height: '100%' }}
      defaultSelectedKeys={[MENU[0].path]}
      mode='inline'>
      {MENU.map((item, i) => (
        <Item key={item.path} title={item.title}>
          <NavLink key={i} exact to={item.path}>
            {item.title}
          </NavLink>
        </Item>
      ))}
    </Menu>
  )
}
