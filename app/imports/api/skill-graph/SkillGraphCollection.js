/**
 * Created by reedvilanueva on 11/3/16.
 */
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import BaseCollection from '/imports/api/base/BaseCollection';
import {Meteor} from 'meteor/meteor';

// I think can also import normal js libraries. see https://guide.meteor.com/structure.html#importing-from-packages

/** @module SkillGraph */

/**
 * @extends BaseCollection
 */
class Edge {

  /**
   * @param {String} v
   * @param {String} w
   * @param {Number} weight
   * Creates edge object
   */
  constructor(v, w, weight) {
    check(v, String);
    check(w, String);
    check(weight, Number);
    this._v = v;
    this._w = w;
    this._baseWeight = 10;
    this._weight = weight + this._baseWeight;
  }

  /**
   *
   * @returns {Number} the weight of this edge
   */
  getWeight() {
    return this._weight;
  }

  setWeight(weight) {
    this._weight = weight;
  }

  /**
   *
   * @returns {String} either of the vertices of this edge
   */
  either() {
    return this._v;
  }

  or() {
    return this._w;
  }

  /**
   *
   * @param vertex
   * @returns {String} the vertex opposite to the one provided on this edge
   */
  other(vertex) {
    return (vertex === this._v)
        ? this._w
        : this._v;
  }

  /**
   *
   * @param {string} v
   * @param {string} w
   * @returns {boolean} true when this edge connects vertices v and w, else false
   */
  connects(v, w) {
    return (this.either() === v && this.other(v) === w)
        || (this.either() === w && this.other(w) === v);
  }

  /**
   *
   * @param thatEdge
   * @returns {number} -1 if 'that' dominates this edge, +1 if this edge dominates 'that', else 0
   */
  compareTo(thatEdge) {
    if (this.getWeight() < thatEdge.getWeight())   return -1;
    else
      if (this.getWeight() > thatEdge.getWeight()) return +1;
      else                                         return 0;
  }

  // For debugging. Will depend on what is stored as _v and _w (would need to be printable things)
  toString() {
    return `(${this._v})--(${this._w}): ${this._weight}`;
  }

}
export {Edge};  // needed so we can create Edge instances in other files

class SkillGraph extends BaseCollection {

  /**
   * Creates the Semester collection.
   */
  constructor() {
    // set the parent _collection field to be used as an adjacency list for skill nodes
    super('SkillGraph', new SimpleSchema({
      skill: { label: 'skill', optional: false, type: String },
      adj: { label: 'adj', optional: false, type: [Edge] },
    }));

    this._edgeCount = 0;
    this._vertexCount = 0;
  }

  edgeCount() {
    return this._edgeCount;
  }

  vertexCount() {
    return this._vertexCount;
  }

  /**
   *
   * @param skill
   * adds the given skill to the graph if none with that label currently exists
   */
  addVertex(skill) {
    check(skill, String);
    const exists = this._collection.findOne({ skill: skill });
    if (!exists) {
      const newSkill = {
        skill: skill,
        adj: [],
      };
      this._collection.insert(newSkill);

      this._vertexCount++;
    }
  }

  /**
   * @param edge
   * Add an edge to the graph
   * FIXME: WARNING: assumes that the vertices of the inserting edge are already in the graph
   */
  addEdge(edge) {
    check(edge, Edge);
    console.log(`edge is instanceOf Edge: ${(edge instanceof Edge)}`);
    console.log(`addingEdge ${edge}`);
    const v = edge.either();
    const w = edge.other(v);
    const adjV = this.adjList(v);
    const adjW = this.adjList(w);

    // check that adj list of v does NOT ALREADY contain an edge to w
    // Meteor wont store the edge objects as Edge instances. see http://stackoverflow.com/a/32554410
    // So need special way to use Edge methods. see http://stackoverflow.com/a/8736980
    const existingEdge = _.find(adjV, (e) => {
          return (e._v === v && e._w === w)
              || (e._v === w && e._w === v);
          // FIXME: can't use Edge.prototype.connects(v, w).call(e) here b/c connects() uses other Edge methods and Meteor will not store adj arrays items as Edge instances (rather as generic objects).
        }
    );
    if (!existingEdge) {
      console.log(`edge ${v}--${w} NOT exists`);
      // if edge NOT already in adjLists of v and w, add it to BOTH those lists
      this._collection.update({ skill: v }, { $addToSet: { adj: edge } });
      this._collection.update({ skill: w }, { $addToSet: { adj: edge } });
      this._edgeCount++;
    } else {
      console.log(`edge ${v}--${w} ALREADY exists`);
      // else edge v-w already in adj. of v AND w, update the weight on that edge for each vertex.
      // as long as we have been adding edges using addEdge(), there should be no case where v has an edge
      // v-w, but w does not.
      const incAmount = 10;

      for (let i = 0; i < adjV.length; i++) {
        // Meteor wont store the edge objects as Edge instances.
        // So need special way to use Edge method. see http://stackoverflow.com/a/8736980
        if ((Edge.prototype.either.call(adjV[i]) == v && Edge.prototype.or.call(adjV[i]) == w) || (Edge.prototype.either.call(adjV[i]) == w && Edge.prototype.or.call(adjV[i]) == v)) {
          //  create new edge to replace old edge
          const newEdge = new Edge(v,w, Edge.prototype.getWeight.call(adjV[i]) + incAmount);
          //  replace old edge in both adjLists
          adjV[i] = newEdge;
          // update the adjList of v and use to replace the old one
          // see http://stackoverflow.com/a/38864747
          /*Edge.prototype.setWeight(
              Edge.prototype.getWeight.call(adjV[i]) + incAmount)
              .call(adjV[i]);*/
          // TODO: I fully overwrite the old adj array b/c IDK how the passing by reference works here.
          // If I were to just change the value of adjV[i], would that change automatically be reflected
          // in the collection doc. whoes adj field I am modifying?
          this._collection.update({ skill: v }, { $set: { adj: adjV } });

          break;
        }
      }
      for (let i = 0; i < adjW.length; i++) {
        // Meteor wont store the edge objects as Edge instances.
        // So need special way to use Edge method. see http://stackoverflow.com/a/8736980
        if ((Edge.prototype.either.call(adjW[i]) == v && Edge.prototype.or.call(adjW[i]) == w) || (Edge.prototype.either.call(adjW[i]) == w && Edge.prototype.or.call(adjW[i]) == v)) {
          //  create new edge to replace old edge
          const newEdge = new Edge(v,w, Edge.prototype.getWeight.call(adjW[i]) + incAmount);
          //  replace old edge in both adjLists
          adjW[i] = newEdge;
          // update the adjList of v and use to replace the old one
          // see http://stackoverflow.com/a/38864747
/*          Edge.prototype.setWeight(
           Edge.prototype.getWeight.call(adjV[i]) + incAmount)
           .call(adjV[i]);
           */
          // TODO: I fully overwrite the old adj array b/c IDK how the passing by reference works here.
          // If I were to just change the value of adjV[i], would that change automatically be reflected
          // in the collection doc. whoes adj field I am modifying?
          this._collection.update({ skill: w }, { $set: { adj: adjW } });

          break;
        }
      }


/*      for (let i = 0; i < adjW.length; i++) {
        if (Edge.prototype.connects(v, w).call(adjW[i])) {
          // update the adjList of w and use to replace the old one
          Edge.prototype.setWeight(
              Edge.prototype.getWeight().call(adjW[i]) + incAmount)
              .call(adjW[i]);
          this._collection.update({ skill: w }, { $set: { adj: adjW } });

          break;
        }
      }
      */
    }
    console.log();
  }

  /**
   *
   * @param {[String]} skills
   * Adds all skills to the graph, connects all listed skills to each other each with a single edge.
   */
  addVertexList(skills) {
    // add all vertices in skills to graph
    _.each(skills, (skill) => {
      this.addVertex(skill);
    });

    // add edges to graph
    // all the skills get ONE undirected edge to the other skills mentioned in the skills array
    // (excluding themselves and avoid double-counting)
    for (let i = 0; i < skills.length - 1; i++) {
      for (let j = i + 1; j < skills.length; j++) {
        let edge = new Edge(skills[i], skills[j], 0);
        // TODO: these edges are objects, which get passed by reference. Will there be a problem with these edge instances being destroyed and thus the collection doc. holding the references to them will no longer have that data?
        this.addEdge(edge);
      }
    }
  }

  /**
   * @param skill
   * @returns {[Edge]} the adjacency list associated with the given skill in the graph
   */
  adjList(skill) {
    //console.log(`In adjList(${skill})`);
    const skillVertex = this._collection.findOne({ skill: skill });
    if (skillVertex == null){
      return null;
    }
    console.log(skillVertex);
    //console.log(`skillVertex.adj[0] is instanceOf Edge: ${(skillVertex.adj[0] instanceof Edge)}`);
    //console.log(skillVertex.adj[0]);
    console.log();
    return skillVertex.adj;
  }

  adjListToString(skill) {
    let str = `skill: ${skill}\n`;
    for (let edge of this.adjList(skill)) {
      //console.log(edge);
      // Meteor wont store the edge objects as Edge instances. see http://stackoverflow.com/a/8736980
      str += `${Edge.prototype.toString.call(edge)}\n`;  // call arg sets context (eg. defines what 'this' refers to)
    }
    return str;
  }

  getRelatedSkills(skill) {
    const adjList = this.adjList(skill);
    if (adjList == null) {
      return null;
    }
    let relatedSkills = [this.adjList(skill)[0], this.adjList(skill)[1], this.adjList(skill)[2]];
    console.log(relatedSkills);
    for (let edge of this.adjList(skill)) {
      console.log(edge);
      if (Edge.prototype.getWeight.call(edge) > Edge.prototype.getWeight.call(relatedSkills[0])) {
        relatedSkills[0] = edge;
      }
      else if (Edge.prototype.getWeight.call(edge) > Edge.prototype.getWeight.call(relatedSkills[1])) {
          relatedSkills[1] = edge;
      }
      else if (Edge.prototype.getWeight.call(edge) > Edge.prototype.getWeight.call(relatedSkills[2])) {
            relatedSkills[2] = edge;
      }
    }
    for (let i = 0; i < 3; i += 1) {
      if (Edge.prototype.either.call(relatedSkills[i]) == skill)
        relatedSkills[i] = Edge.prototype.or.call(relatedSkills[i]);
      else relatedSkills[i] = Edge.prototype.either.call(relatedSkills[i]);
    }

    return relatedSkills;
  }
}

/**
 * Provides the singleton instance of this class to all other entities.
 */
// WARNING: the exported const can't have same name as 'type' param. given to constructor
// (causes 'duplicate declaration' error)
export const SkillGraphCollection = new SkillGraph();
