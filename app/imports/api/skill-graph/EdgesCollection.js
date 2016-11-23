/**
 * Created by reedvilanueva on 11/22/16.
 */
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import BaseCollection from '/imports/api/base/BaseCollection';
import {SkillGraphCollection} from './SkillGraphCollection.js';

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
          vID: { label: 'vID', optional: false, type: String },
          wID: { label: 'wID', optional: false, type: String },
          weight: { label: 'weight', optional: false, type: Number },
          baseWeight: { label: 'baseWeight', optional: false, type: Number },
        }),
        undefined
    );

    this._edgeCount = 0;
  }

  /**
   * @param edge
   * Add an edge to the graph
   * WARNING:
   * Assumes that the vertices of the inserting edge are already in the graph w/ addVertex(skill).
   */
  addEdge(vID, wID, weight) {
    // console.log(`edge is instanceOf Edge: ${(edge instanceof Edge)}`);
    console.log(`addingEdge ${vID}, ${wID}, ${weight}`);
    // let vID = edge.either();
    // let wID = edge.other(vID);
    // const adjV = this.adjList(vID);
    // const adjW = this.adjList(wID);

    // check that this connecting edge does not already exist, return the edge if exists
    const existingEdge = this.connects(vID, wID);

    if (!existingEdge) {
      console.log(`edge ${vID}--${wID} NOT exists: inserting`);

      // if edge NOT already in adjLists of vID and wID, add it to BOTH those lists
      const edge = { vID: vID, wID: wID, weight: weight, baseWeight: 0 };
      this._insertEdge(edge);
    } else {
      console.log(`edge ${vID}--${wID} ALREADY exists: updating`);

      // else edge vID-wID already in adj. of vID AND wID, update the weight on that edge for both vertices.
      // As long as we have been adding edges using addEdge(), there should be no case where vID has an edge
      // vID-wID, but wID does not.
      this._updateEdge(existingEdge);
    }
    console.log();
  }

  _insertEdge(edge) {
    this._collection.insert(edge);
    this._edgeCount++;
  }

  _updateEdge(edge) {
    const incAmount = 10;
    this._collection.update({ _id: edge._id }, { $inc: { weight: incAmount } });
  }

  /**
   *
   * @returns {String} either of the vertices of this edge
   */
  either(doc) {
    return doc.vID;
  }

  /**
   *
   * @param vertex
   * @returns {String} the vertex opposite to the one provided on this edge
   */
  other(doc, vertex) {
    return (vertex === doc.vID) ? doc.wID : doc.vID;
  }

  /**
   *
   * @param {string} vID
   * @param {string} wID
   * @returns {EdgesCollection doc / undefined} true when this edge connects vertices vID and wID, else false
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
   * @param thatEdge
   * @returns {number} -1 if 'that' dominates this edge, +1 if this edge dominates 'that', else 0
   */
  compareTo(thisDoc, thatDoc) {
    if (thisDoc.weight < thatDoc.weight)   return -1;
    else
      if (thisDoc.weight > thatDoc.weight) return +1;
      else                                 return 0;
  }

  // For debugging. Will depend on what is stored as v and w (would need to be printable things)
  toString(doc) {
    const v = 0;  // get skill corresponding w/ _id from doc.v
    const w = 0;  // get skill corresponding w/ _id from doc.w
    return `(${doc.v})--(${doc.w}): ${doc.weight}`;
  }

}

/**
 * Provides the singleton instance of this class to all other entities.
 */
// WARNING: the exported const can't have same name as 'type' param. given to constructor
// (causes 'duplicate declaration' error)
export const EdgesCollection = new Edges();