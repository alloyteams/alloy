/**
 * Created by reedvilanueva on 11/22/16.
 */
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {check} from 'meteor/check'
import BaseCollection from '/imports/api/base/BaseCollection';
import {SkillGraphCollection} from './SkillGraphCollection.js'

/** @module EdgeCollection */

/**
 * @extends BaseCollection
 */

/**
 * edge collection for skillgraph, where each vertex is a lowercase, whitespace-removed string
 */
class Edges extends BaseCollection {

  /**
   * Creates edge object with the given params.
   * Vertices as set as lowercase, whitespace-removed strings.
   */
  constructor() {
    super(
        'Edges',
        new SimpleSchema({
          // vertices are stored as the _ids of the skillgraph documents each edge connects
          v: { label: 'v', optional: false, type: String },
          w: { label: 'w', optional: false, type: String },
          vID: { label: 'vID', optional: false, type: String },
          wID: { label: 'wID', optional: false, type: String },
          weight: { label: 'weight', optional: false, type: Number },
          baseWeight: { label: 'baseWeight', optional: false, type: Number },
        }),
        undefined
    );

    this._edgeCount = 0;
    this._incAmount = 10;
  }

  edgeCount() {
    return this._edgeCount;
  }

  /**
   *
   * @param {doc} v: a vertex doc
   * @param {doc} w: a vertex doc
   * @param {number} weight
   * Add an edge to the Edge collection w/ the given vertices and weight
   * WARNING:
   * Assumes that the vertices of the inserting edge are already in the graph w/ addVertex(skill).
   */
  addEdge(v, w, weight) {
    check(v.skill, String);
    check(v._id, String);
    check(w.skill, String);
    check(w._id, String);
    check(weight, Number);

    // console.log(`edge is instanceOf Edge: ${(edge instanceof Edge)}`);
    console.log(`addingEdge ${v.skill}, ${w.skill}, ${weight}`);
    // let v = edge.either();
    // let w = edge.other(v);
    // const adjV = this.adjList(v);
    // const adjW = this.adjList(w);

    // check that this connecting edge does not already exist, return the edge if exists
    const existingEdge = this.connects(v._id, w._id);

    if (!existingEdge) {
      console.log(`edge ${v.skill}--${w.skill} does NOT exists: inserting`);
      // if edge NOT already in adjLists of v and w, add it to BOTH those lists
      const edge = {
        v: v.skill,
        w: w.skill,
        vID: v._id,
        wID: w._id,
        weight: weight,
        baseWeight: 0
      };
      this._insertEdge(edge);
    } else {
      console.log(`edge ${v.skill}--${w.skill} ALREADY exists: updating`);
      // else edge connecting v and w is already in the Edge collection.
      // We then need to update this existing edge
      this._updateEdge(existingEdge);
    }
    console.log();
  }

  _insertEdge(edge) {
    this._collection.insert(edge);
    this._edgeCount++;
  }

  _updateEdge(edge) {
    this._collection.update({ _id: edge._id }, { $inc: { weight: this._incAmount } });
  }

  //FIXME: why does intellij mark doc.vID as unresolved variable?
  /**
   * @param {doc} doc: an Edge collection doc
   * @returns {String} the _id of either of the vertices of this edge
   */
  either(doc) {
    return doc.v;
  }

  /**
   *
   * @param {doc} doc: an Edge collection doc
   * @param {String} v: a uniform string of a vertex doc
   * @returns {String} the vertex doc _id opposite the given vID on this edge
   */
  other(doc, v) {
    v = utils.makeUniform(v);
    return (v === doc.v) ? doc.w : doc.v;
  }

  /**
   *
   * @param {string} vID: an _id string of a vertex doc
   * @param {string} wID: an _id string of a vertex doc
   * @returns {doc}
   * returns the Edge doc that connects the given vertexIDs if one exists,
   * else returns undefined.
   */
  connects(vID, wID) {
    return this._collection.findOne({
      $or: [
        { vID: vID, wID: wID },
        { vID: wID, wID: vID }
      ]
    });
  }

  /**
   *
   * @param thisDoc
   * @param thatDoc
   * @returns {number}
   * -1 if 'that' dominates 'this' edge doc,
   * +1 if this edge doc dominates 'that',
   * else 0
   */
  compareTo(thisDoc, thatDoc) {
    if (thisDoc.weight < thatDoc.weight)   return -1;
    else
      if (thisDoc.weight > thatDoc.weight) return +1;
      else                                 return 0;
  }

  /**
   *
   * @param {String} vID: an _id string of a vertex doc
   * @return {Array}
   * Returns array of Edge docs that vID is a vertex of
   */
  adjList(vID) {
    // find all the docs where vID is one of the vertices
    return this._collection.find({
      $or: [
        { vID: vID },
        { wID: vID }
      ]
    }).fetch();
  }

  // For debugging. Will depend on what is stored as v and w (would need to be printable things)
  docString(doc) {
    return `(${doc.v})--(${doc.w}): ${doc.weight}\n`;
  }

}

/**
 * Provides the singleton instance of this class to all other entities.
 */
// WARNING: the exported const can't have same name as 'type' param. given to constructor
// (causes 'duplicate declaration' error)
export const EdgesCollection = new Edges();