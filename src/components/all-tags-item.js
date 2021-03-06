import React from "react";

import Tag from "components/tag";

import {
  tags_bubble,
  tags_count,
  tags_add,
  tags_cross,
  edit_hover_container,
  edit_hover_pencil,
  background
} from "css/app.css";

import pick from "languages";

const rename_tag_placeholder = pick({
  en: "Rename tag",
  fr: "Renommer un tag"
});

const cell_shrink_style = {
  padding: "0em 0.1em"
};

const input_style = {
  width: "50%",
  border: "none",
  background: "none",
  outline: "none",
  paddingBottom: 0,
  borderBottom: "3px solid rgb(10, 50, 100)",
  marginBottom: "2px",
  fontSize: "1.15em"
};

class AllTagsItem extends React.Component {
  constructor(props) {
    super(props);

    this.textInput = null;
  }

  componentDidUpdate() {
    if (this.textInput) this.textInput.focus();
  }

  render() {
    const enter_key_code = 13;
    const escape_key_code = 27;

    let keyUp = event => {
      if (event.keyCode === enter_key_code) {
        event.preventDefault();
        if (event.target.value.length > 0) {
          this.props.renameTag(event.target.value);
          event.target.value = "";
        }
        this.props.stopEditingTag();
      } else if (event.keyCode === escape_key_code) {
        this.props.stopEditingTag();
      }
    };

    let res;

    let tag = this.props.tag;

    let component_style = {
      position: "relative",
      width: "100%",
      background: "none",
      margin: "0",
      padding: "4px 0.5em"
    };

    let content_style = {
      opacity: this.props.opacity,
      position: "relative",
      zIndex: "1"
    };

    let background_style = {
      transition: "all 0.4s",
      WebkitTransition: "all 0.4s",
      height: "100%",
      width: this.props.percentage + "%",
      opacity: "0.2",
      backgroundColor: "rgb(10, 50, 100)"
    };

    let delete_bubble = (
      <div
        className={tags_bubble + " " + tags_cross}
        onClick={this.props.deleteTag}
      >
        <i className="fi-trash" />
      </div>
    );

    let count_or_action_bubble = this.props.shoud_display_count ? (
      <div className={tags_bubble + " " + tags_count}>
        {this.props.tag_number}
      </div>
    ) : this.props.node_has_tag ? (
      <div
        className={tags_bubble + " " + tags_cross}
        onClick={this.props.removeTagFromNode}
      >
        <i className="fi-x" />
      </div>
    ) : (
      <div
        className={tags_bubble + " " + tags_add}
        onClick={this.props.addTagToNode}
      >
        <i className="fi-plus" />
      </div>
    );

    let tag_pill;
    if (this.props.editing) {
      tag_pill = (
        <input
          style={input_style}
          onFocus={e => {
            e.target.select();
          }}
          onMouseUp={e => {
            e.stopPropagation();
          }}
          onKeyUp={keyUp}
          onBlur={e => {
            this.props.renameTag(e.target.value);
            this.props.stopEditingTag();
          }}
          defaultValue={tag}
          placeholder={rename_tag_placeholder}
          ref={component => {
            this.textInput = component;
          }}
        />
      );
    } else {
      tag_pill = (
        <Tag
          text={tag}
          editing={false}
          clickHandler={this.props.startEditingTag}
          removeHandler={() => {}}
        />
      );
    }

    let pencil = this.props.editing ? (
      <span />
    ) : (
      <i
        className={"fi-pencil " + edit_hover_pencil}
        style={{ opacity: "0.3" }}
      />
    );

    res = (
      <div
        className={edit_hover_container}
        onMouseEnter={this.props.highlightTag}
        style={component_style}
      >
        <div className="grid-x" style={content_style}>
          <div className="cell shrink" style={cell_shrink_style}>
            {delete_bubble}
          </div>
          <div className="cell shrink" style={cell_shrink_style}>
            {count_or_action_bubble}
          </div>
          <div className="cell shrink" style={cell_shrink_style}>
            {tag_pill}
          </div>
          <div className="cell shrink" style={cell_shrink_style}>
            {pencil}
          </div>
        </div>
        <div className={background} style={background_style} />
      </div>
    );

    return res;
  }
}

export default AllTagsItem;
