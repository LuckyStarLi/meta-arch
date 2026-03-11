import { useEffect, useCallback } from 'react'

export interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  handler: (event: KeyboardEvent) => void
  description?: string
}

export interface ShortcutManager {
  register: (shortcut: Shortcut) => void
  unregister: (key: string) => void
  unregisterAll: () => void
}

/**
 * 快捷键管理 Hook
 * 提供全局快捷键注册和管理功能
 */
export function useShortcutManager(): ShortcutManager {
  const shortcuts = new Map<string, Shortcut>()

  const register = useCallback((shortcut: Shortcut) => {
    const keyId = `${shortcut.ctrl ? 'ctrl+' : ''}${shortcut.shift ? 'shift+' : ''}${shortcut.alt ? 'alt+' : ''}${shortcut.meta ? 'meta+' : ''}${shortcut.key.toLowerCase()}`
    shortcuts.set(keyId, shortcut)
  }, [])

  const unregister = useCallback((key: string) => {
    shortcuts.delete(key)
  }, [])

  const unregisterAll = useCallback(() => {
    shortcuts.clear()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keyId = `${event.ctrlKey ? 'ctrl+' : ''}${event.shiftKey ? 'shift+' : ''}${event.altKey ? 'alt+' : ''}${event.metaKey ? 'meta+' : ''}${event.key.toLowerCase()}`
      
      const shortcut = shortcuts.get(keyId)
      if (shortcut) {
        event.preventDefault()
        event.stopPropagation()
        shortcut.handler(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      unregisterAll()
    }
  }, [shortcuts, unregisterAll])

  return {
    register,
    unregister,
    unregisterAll,
  }
}

/**
 * 快捷键帮助组件 - 显示所有可用快捷键
 */
export interface ShortcutHelpProps {
  shortcuts: Shortcut[]
  title?: string
}

export function ShortcutHelp({ shortcuts, title = '快捷键' }: ShortcutHelpProps) {
  const formatShortcut = (shortcut: Shortcut) => {
    const parts: string[] = []
    if (shortcut.ctrl) parts.push('Ctrl')
    if (shortcut.shift) parts.push('Shift')
    if (shortcut.alt) parts.push('Alt')
    if (shortcut.meta) parts.push('Cmd')
    parts.push(shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1))
    return parts.join(' + ')
  }

  return (
    <div
      style={{
        padding: '16px',
        background: 'var(--color-neutral-50)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-neutral-200)',
      }}
    >
      <h3 style={{ margin: '0 0 12px', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>
        {title}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '8px' }}>
        {shortcuts.map((shortcut, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              background: 'var(--color-neutral-0)',
              borderRadius: 'var(--radius-base)',
              border: '1px solid var(--color-neutral-200)',
            }}
          >
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-700)' }}>
              {shortcut.description || '未命名'}
            </span>
            <kbd
              style={{
                padding: '4px 8px',
                background: 'var(--color-neutral-100)',
                border: '1px solid var(--color-neutral-300)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-xs)',
                fontFamily: 'var(--font-family-mono)',
                color: 'var(--color-neutral-700)',
              }}
            >
              {formatShortcut(shortcut)}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 预定义快捷键
 */
export const PRESET_SHORTCUTS = {
  // 编辑操作
  UNDO: { key: 'z', ctrl: true, description: '撤销' },
  REDO: { key: 'y', ctrl: true, description: '重做' },
  SAVE: { key: 's', ctrl: true, description: '保存' },
  
  // 选择操作
  SELECT_ALL: { key: 'a', ctrl: true, description: '全选' },
  DESELECT: { key: 'escape', description: '取消选择' },
  
  // 删除操作
  DELETE: { key: 'delete', description: '删除选中' },
  BACKSPACE: { key: 'backspace', description: '删除选中' },
  
  // 视图操作
  ZOOM_IN: { key: '+', ctrl: true, description: '放大' },
  ZOOM_OUT: { key: '-', ctrl: true, description: '缩小' },
  ZOOM_FIT: { key: '0', ctrl: true, description: '适应屏幕' },
  
  // 工具
  HELP: { key: '/', ctrl: true, description: '显示帮助' },
} as const
