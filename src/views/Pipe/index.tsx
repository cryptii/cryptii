
import React, { useRef, useState } from 'react'
import Toolbar from '../Toolbar'

/**
 * Drag event state
 */
type DragEventState = {
  measureDragTargets: Function,
  $scroll: Element,
  $pipes: Element[],
  scrollTop: number,
  positions: number[],
  dragY: number
}

export default function Pipe(props: any): any {
  // Reference to the pipe element
  const pipeRef = useRef<HTMLDivElement>(null)

  // Reference counter reducing `onDragEnter` and `onDragLeave` to single events
  const dragReferenceCounter = useRef(0)

  // Index of the pipe part currently targeted by the user dragging, -1 if none
  const [dragIndex, setDragIndex] = useState(-1)

  // State attached to a single dragging event (not influencing rendering)
  const dragEvent = useRef<DragEventState | null>(null)

  function onDragEnter (event: React.DragEvent<HTMLElement>) {
    // Only handle the first `onDragEnter`
    if (dragReferenceCounter.current++ !== 0) {
      return
    }

    // Verify if this drag event can be handled
    if (pipeRef.current === null || !props.onDragEnter(event)) {
      return
    }

    // Handle drag event ourselves
    event.preventDefault()

    // Bind to elements needed to track dragging
    const $pipe = pipeRef.current
    const $scroll = $pipe.closest('.app__content')
    const $pipes = Array.from($pipe.querySelectorAll('.pipe__pipe'))

    // Compose drag event state (reference)
    const measure = measureDragTargets
    dragEvent.current = {
      measureDragTargets: measure,
      $scroll,
      $pipes,
      scrollTop: 0,
      positions: [],
      dragY: 0
    }

    // Bind to events
    window.addEventListener('resize', measure)
    $scroll.addEventListener('scroll', measure)

    // Initial measure call (refreshed on resize and scroll)
    measure()
  }

  function measureDragTargets () {
    if (dragEvent.current !== null) {
      // Measure pipe part and scroll positions
      const scrollTop = dragEvent.current.$scroll.scrollTop
      dragEvent.current.scrollTop = scrollTop
      dragEvent.current.positions = dragEvent.current.$pipes.map($part => {
        const rect = $part.getBoundingClientRect()
        return rect.top + rect.height * 0.5 + scrollTop
      })

      // Recalculate drag index
      updateDragIndex()
    }
  }

  function onDragOver (event: React.DragEvent<HTMLElement>) {
    if (dragEvent.current !== null) {
      // Update current dragging position and recalculate drag index
      event.preventDefault()
      dragEvent.current.dragY = event.clientY
      updateDragIndex()
    }
  }

  function updateDragIndex () {
    if (dragEvent.current !== null) {
      // Calculate pipe index closest to current dragging position
      const { dragY, positions, scrollTop } = dragEvent.current
      let i = 0
      while (i < positions.length - 1 &&
        (positions[i] + positions[i + 1]) * 0.5 < dragY + scrollTop) {
        i++
      }
      setDragIndex(i)
    }
  }

  function onDrop (event: React.DragEvent<HTMLElement>) {
    const dropIndex = dragEvent.current !== null ? dragIndex : -1

    // Trigger leave event to clean up
    dragReferenceCounter.current = 1
    onDragLeave(event)

    // Handle drop event
    if (dropIndex !== -1) {
      event.preventDefault()
      props.onDragDrop(dropIndex, event)
    }
  }

  function onDragLeave (event: React.DragEvent<HTMLElement>) {
    // Only handle the last `onDragLeave` event
    if (--dragReferenceCounter.current !== 0 || dragEvent.current === null) {
      return
    }

    // Unregister resize and scroll events installed before
    const { measureDragTargets, $scroll } = dragEvent.current
    window.removeEventListener('resize', measureDragTargets)
    $scroll.removeEventListener('scroll', measureDragTargets)

    // Clear drag event state and reset the dragging index
    dragEvent.current = null
    setDragIndex(-1)
  }

  function renderPart(index: number, dragIndex: number) {
    let className = 'pipe__pipe'
    if (index === dragIndex) {
      className += ' pipe__pipe--dragging'
    }
    return (
      <button key={index} className={className}>
        <div className="pipe__btn-add">Add encoder or viewer</div>
        <div className="pipe__drop-handle"></div>
      </button>
    )
  }

  return (
    <div
      ref={pipeRef}
      className={'pipe' + (dragIndex !== -1 ? ' pipe--dragging' : '')}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <div className="pipe__toolbar">
        <Toolbar
          items={[
            {
              title: 'About',
              icon: 'logo',
              enabled: true,
              onClick: () => {}
            },
            'divider',
            {
              title: 'Library',
              icon: 'plusCircleSolid',
              enabled: true,
              onClick: () => { console.log('library!') }
            },
            'divider',
            {
              title: 'Undo',
              icon: 'undo',
              enabled: props.undoEnabled,
              onClick: props.onUndoClick
            },
            {
              title: 'Redo',
              icon: 'redo',
              enabled: props.redoEnabled,
              onClick: props.onRedoClick
            },
            'divider',
            {
              title: 'Get share link',
              icon: 'link',
              enabled: true,
              onClick: () => props.onShareClick('link')
            },
            {
              title: 'Share on Facebook',
              icon: 'facebook',
              enabled: true,
              onClick: () => props.onShareClick('facebook')
            },
            {
              title: 'Share on Twitter',
              icon: 'twitter',
              enabled: true,
              onClick: () => props.onShareClick('twitter')
            },
            'divider',
          ]} />
      </div>
      <div className="pipe__content">
        <div className="pipe__inner">
          {props.bricks.map((brick: any, index: number) =>
            <>
              {index === 0 && renderPart(0, dragIndex)}
              <div key={props.brickIds[index]} className="pipe__brick">{brick}</div>
              {renderPart(index + 1, dragIndex)}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
