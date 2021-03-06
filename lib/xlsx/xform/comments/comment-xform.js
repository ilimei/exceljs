
const RichTextXform = require('../strings/rich-text-xform');
const utils = require('../../../utils/utils');
const BaseXform = require('../base-xform');

/**
    <comment ref="B1" authorId="0">
        <text>
            <r>
                <rPr>
                    <b/>
                    <sz val="9"/>
                    <rFont val="宋体"/>
                    <charset val="134"/>
                </rPr>
                <t>51422:</t>
            </r>
            <r>
                <rPr>
                    <sz val="9"/>
                    <rFont val="宋体"/>
                    <charset val="134"/>
                </rPr>
                <t xml:space="preserve">&#10;test</t>
            </r>
        </text>
    </comment>
 */

const CommentXform = (module.exports = function(model) {
    this.model = model;
});

CommentXform.FONT_OPTIONS = {
    tagName: 'rPr',
    fontNameTag: 'rFont',
};

utils.inherits(CommentXform, BaseXform, {
    get tag() {
        return 'r';
    },

    get richTextXform() {
        if (!this._richTextXform) {
            this._richTextXform = new RichTextXform();
        }
        return this._richTextXform;
    },

    render(xmlStream, model) {
        model = model || this.model;

        xmlStream.openNode('comment', {
            ref: model.ref,
        });
        xmlStream.openNode('text');
        if (model.texts) {
            model.texts.forEach(text => {
                this.richTextXform.render(xmlStream, text);
            });
        }
        xmlStream.closeNode();
        xmlStream.closeNode();
    },

    parseOpen(node) {
        if (this.parser) {
            this.parser.parseOpen(node);
            return true;
        }
        switch (node.name) {
            case 'comment':
                this.model = {
                    texts: [],
                    ...node.attributes,
                };
                return true;
            case 'r':
                this.parser = this.richTextXform;
                this.parser.parseOpen(node);
                return true;
            default:
                return false;
        }
    },
    parseText(text) {
        if (this.parser) {
            this.parser.parseText(text);
        }
    },
    parseClose(name) {
        switch (name) {
            case 'richTextXform':
                return false;
            case 'r':
                this.model.texts.push(this.parser.model);
                this.parser = undefined;
                return true;
            default:
                if (this.parser) {
                    this.parser.parseClose(name);
                }
                return true;
        }
    },
});
